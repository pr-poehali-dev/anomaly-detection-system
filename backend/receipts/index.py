import json
import os
import psycopg2
from datetime import datetime


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event, context):
    """Управление приходами товаров на склад: создание, список, подтверждение"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}

    if method == 'GET':
        return get_receipts(params, headers)
    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        return create_receipt(body, headers)
    elif method == 'PUT':
        body = json.loads(event.get('body', '{}'))
        return confirm_receipt(body, headers)

    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}


def get_receipts(params, headers):
    conn = get_conn()
    cur = conn.cursor()

    receipt_id = params.get('id')
    if receipt_id:
        cur.execute(
            "SELECT id, receipt_number, supplier, status, total_amount, note, created_at FROM receipts WHERE id = %s",
            (receipt_id,)
        )
        row = cur.fetchone()
        if not row:
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Приход не найден'})}

        receipt = {
            'id': row[0], 'receipt_number': row[1], 'supplier': row[2],
            'status': row[3], 'total_amount': float(row[4]), 'note': row[5],
            'created_at': row[6].isoformat()
        }

        cur.execute(
            "SELECT id, product_id, product_name, quantity, price, total FROM receipt_items WHERE receipt_id = %s",
            (receipt_id,)
        )
        receipt['items'] = [
            {'id': r[0], 'product_id': r[1], 'product_name': r[2],
             'quantity': r[3], 'price': float(r[4]), 'total': float(r[5])}
            for r in cur.fetchall()
        ]

        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps(receipt)}

    cur.execute(
        "SELECT id, receipt_number, supplier, status, total_amount, note, created_at FROM receipts ORDER BY created_at DESC LIMIT 50"
    )
    receipts = [
        {
            'id': r[0], 'receipt_number': r[1], 'supplier': r[2],
            'status': r[3], 'total_amount': float(r[4]), 'note': r[5],
            'created_at': r[6].isoformat()
        }
        for r in cur.fetchall()
    ]

    cur.close()
    conn.close()
    return {'statusCode': 200, 'headers': headers, 'body': json.dumps(receipts)}


def create_receipt(body, headers):
    supplier = body.get('supplier', '')
    note = body.get('note', '')
    items = body.get('items', [])

    if not items:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Добавьте хотя бы один товар'})}

    conn = get_conn()
    cur = conn.cursor()

    receipt_number = 'ПР-' + datetime.now().strftime('%Y%m%d-%H%M%S')
    total_amount = sum(item.get('quantity', 0) * item.get('price', 0) for item in items)

    cur.execute(
        "INSERT INTO receipts (receipt_number, supplier, status, total_amount, note) VALUES (%s, %s, %s, %s, %s) RETURNING id",
        (receipt_number, supplier, 'new', total_amount, note)
    )
    receipt_id = cur.fetchone()[0]

    for item in items:
        qty = item.get('quantity', 1)
        price = item.get('price', 0)
        product_name = item.get('product_name', '')
        product_id = item.get('product_id')
        total = qty * price

        cur.execute(
            "INSERT INTO receipt_items (receipt_id, product_id, product_name, quantity, price, total) VALUES (%s, %s, %s, %s, %s, %s)",
            (receipt_id, product_id, product_name, qty, price, total)
        )

    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 201,
        'headers': headers,
        'body': json.dumps({'id': receipt_id, 'receipt_number': receipt_number, 'total_amount': total_amount})
    }


def confirm_receipt(body, headers):
    receipt_id = body.get('id')
    if not receipt_id:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Укажите id прихода'})}

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT status FROM receipts WHERE id = %s", (receipt_id,))
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Приход не найден'})}

    if row[0] == 'confirmed':
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Приход уже подтверждён'})}

    cur.execute("SELECT product_id, product_name, quantity, price FROM receipt_items WHERE receipt_id = %s", (receipt_id,))
    items = cur.fetchall()

    for product_id, product_name, qty, price in items:
        if product_id:
            cur.execute(
                "UPDATE products SET quantity = quantity + %s, updated_at = NOW() WHERE id = %s",
                (qty, product_id)
            )
        else:
            cur.execute(
                "INSERT INTO products (name, quantity, price) VALUES (%s, %s, %s) RETURNING id",
                (product_name, qty, price)
            )
            new_product_id = cur.fetchone()[0]
            cur.execute(
                "UPDATE receipt_items SET product_id = %s WHERE receipt_id = %s AND product_name = %s AND product_id IS NULL",
                (new_product_id, receipt_id, product_name)
            )

    cur.execute("UPDATE receipts SET status = 'confirmed' WHERE id = %s", (receipt_id,))
    conn.commit()
    cur.close()
    conn.close()

    return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'success': True, 'message': 'Приход подтверждён, остатки обновлены'})}
