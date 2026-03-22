import json
import os
import psycopg2
from datetime import datetime


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event, context):
    """Управление списаниями товаров со склада: создание, список, подтверждение"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}

    if method == 'GET':
        return get_writeoffs(params, headers)
    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        return create_writeoff(body, headers)
    elif method == 'PUT':
        body = json.loads(event.get('body', '{}'))
        return confirm_writeoff(body, headers)

    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}


def get_writeoffs(params, headers):
    conn = get_conn()
    cur = conn.cursor()

    writeoff_id = params.get('id')
    if writeoff_id:
        cur.execute(
            "SELECT id, writeoff_number, reason, status, total_amount, note, created_at FROM writeoffs WHERE id = %s",
            (writeoff_id,)
        )
        row = cur.fetchone()
        if not row:
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Списание не найдено'})}

        writeoff = {
            'id': row[0], 'writeoff_number': row[1], 'reason': row[2],
            'status': row[3], 'total_amount': float(row[4]), 'note': row[5],
            'created_at': row[6].isoformat()
        }

        cur.execute(
            "SELECT id, product_id, product_name, quantity, price, total FROM writeoff_items WHERE writeoff_id = %s",
            (writeoff_id,)
        )
        writeoff['items'] = [
            {'id': r[0], 'product_id': r[1], 'product_name': r[2],
             'quantity': r[3], 'price': float(r[4]), 'total': float(r[5])}
            for r in cur.fetchall()
        ]

        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps(writeoff)}

    cur.execute(
        "SELECT id, writeoff_number, reason, status, total_amount, note, created_at FROM writeoffs ORDER BY created_at DESC LIMIT 50"
    )
    writeoffs = [
        {
            'id': r[0], 'writeoff_number': r[1], 'reason': r[2],
            'status': r[3], 'total_amount': float(r[4]), 'note': r[5],
            'created_at': r[6].isoformat()
        }
        for r in cur.fetchall()
    ]

    cur.close()
    conn.close()
    return {'statusCode': 200, 'headers': headers, 'body': json.dumps(writeoffs)}


def create_writeoff(body, headers):
    reason = body.get('reason', '')
    note = body.get('note', '')
    items = body.get('items', [])

    if not items:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Добавьте хотя бы один товар'})}

    conn = get_conn()
    cur = conn.cursor()

    writeoff_number = 'СП-' + datetime.now().strftime('%Y%m%d-%H%M%S')
    total_amount = sum(item.get('quantity', 0) * item.get('price', 0) for item in items)

    cur.execute(
        "INSERT INTO writeoffs (writeoff_number, reason, status, total_amount, note) VALUES (%s, %s, %s, %s, %s) RETURNING id",
        (writeoff_number, reason, 'new', total_amount, note)
    )
    writeoff_id = cur.fetchone()[0]

    for item in items:
        qty = item.get('quantity', 1)
        price = item.get('price', 0)
        product_name = item.get('product_name', '')
        product_id = item.get('product_id')
        total = qty * price

        cur.execute(
            "INSERT INTO writeoff_items (writeoff_id, product_id, product_name, quantity, price, total) VALUES (%s, %s, %s, %s, %s, %s)",
            (writeoff_id, product_id, product_name, qty, price, total)
        )

    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 201,
        'headers': headers,
        'body': json.dumps({'id': writeoff_id, 'writeoff_number': writeoff_number, 'total_amount': total_amount})
    }


def confirm_writeoff(body, headers):
    writeoff_id = body.get('id')
    if not writeoff_id:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Укажите id списания'})}

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT status FROM writeoffs WHERE id = %s", (writeoff_id,))
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Списание не найдено'})}

    if row[0] == 'confirmed':
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Списание уже подтверждено'})}

    cur.execute("SELECT product_id, quantity FROM writeoff_items WHERE writeoff_id = %s", (writeoff_id,))
    items = cur.fetchall()

    for product_id, qty in items:
        if product_id:
            cur.execute(
                "UPDATE products SET quantity = GREATEST(quantity - %s, 0), updated_at = NOW() WHERE id = %s",
                (qty, product_id)
            )

    cur.execute("UPDATE writeoffs SET status = 'confirmed' WHERE id = %s", (writeoff_id,))
    conn.commit()
    cur.close()
    conn.close()

    return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'success': True, 'message': 'Списание подтверждено, остатки обновлены'})}
