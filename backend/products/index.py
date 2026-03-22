import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event, context):
    """Получение списка товаров на складе"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    conn = get_conn()
    cur = conn.cursor()

    params = event.get('queryStringParameters') or {}
    search = params.get('search', '')

    if search:
        cur.execute(
            "SELECT id, name, sku, category, unit, quantity, price, created_at FROM products WHERE name ILIKE %s ORDER BY name LIMIT 100",
            (f'%{search}%',)
        )
    else:
        cur.execute(
            "SELECT id, name, sku, category, unit, quantity, price, created_at FROM products ORDER BY name LIMIT 100"
        )

    products = [
        {
            'id': r[0], 'name': r[1], 'sku': r[2], 'category': r[3],
            'unit': r[4], 'quantity': r[5], 'price': float(r[6]),
            'created_at': r[7].isoformat()
        }
        for r in cur.fetchall()
    ]

    cur.close()
    conn.close()
    return {'statusCode': 200, 'headers': headers, 'body': json.dumps(products)}
