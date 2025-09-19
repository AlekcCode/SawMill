import base64
import json

import requests
import psycopg2
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import SawMill
from django.views.decorators.http import require_GET
from django.db import connection
import os
from django.conf import settings

from telegram import Bot
import asyncio


# Create your views here.

def index(request):
    return render(request, 'index.html')


def catalog(request):
    return render(request, 'catalog.html')


def cart(request):
    return render(request, 'cart.html')


def delivery(request):
    return render(request, 'delivery_page.html')


@require_GET
def return_data_on_catalog(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                'SELECT id, category, size, pieces_per_cube, price_1s_piece, price_1s_cube, price_2s_piece, price_2s_cube, photo FROM sawmill.products')

            products = []
            for row in cursor.fetchall():
                id, category, size, pieces_per_cube, price_1s_piece, price_1s_cube, price_2s_piece, price_2s_cube, photo = row

                photo_filename = None
                photo_url = None

                if photo:
                    # Проверяем тип данных photo
                    if isinstance(photo, bytes):
                        # Если это байты, пробуем декодировать
                        try:
                            photo_filename = photo.decode('utf-8')
                            print(f"Товар {id}: имя файла из bytes - {photo_filename}")
                        except UnicodeDecodeError:
                            # Если не получается декодировать, возможно это бинарные данные изображения
                            print(f"Товар {id}: данные похожи на бинарное изображение")
                            photo_filename = None
                    elif isinstance(photo, str):
                        # Если это уже строка, просто используем
                        photo_filename = photo
                        print(f"Товар {id}: имя файла из строки - {photo_filename}")
                    else:
                        print(f"Товар {id}: неизвестный тип данных для photo: {type(photo)}")

                # Формируем URL к изображению
                if photo_filename:
                    # Убираем возможные лишние символы и пробелы
                    photo_filename = photo_filename.strip()

                    # Проверяем существует ли файл
                    file_path = os.path.join(settings.MEDIA_ROOT, photo_filename)
                    if os.path.exists(file_path):
                        photo_url = f'{settings.MEDIA_URL}{photo_filename}'
                        print(f"Файл найден: {file_path}")
                    else:
                        print(f"Файл не найден: {file_path}")
                        # Попробуем поискать в подпапках
                        for root, dirs, files in os.walk(settings.MEDIA_ROOT):
                            if photo_filename in files:
                                relative_path = os.path.relpath(os.path.join(root, photo_filename), settings.MEDIA_ROOT)
                                photo_url = f'{settings.MEDIA_URL}{relative_path}'
                                print(f"Файл найден в: {relative_path}")
                                break

                products.append({
                    "id": id,
                    "category": category,
                    "size": size,
                    "pieces_per_cube": pieces_per_cube,
                    "price_1s_piece": float(price_1s_piece) if price_1s_piece else None,
                    "price_1s_cube": float(price_1s_cube) if price_1s_cube else None,
                    "price_2s_piece": float(price_2s_piece) if price_2s_piece else None,
                    "price_2s_cube": float(price_2s_cube) if price_2s_cube else None,
                    "photo_url": photo_url
                })

        return JsonResponse({"data": products})

    except Exception as e:
        print(f"Ошибка выполнения запроса: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": f"Ошибка выполнения запроса: {e}"}, status=500)


async def send_message_to_telegram(order_data, request):
    referer = request.META.get("HTTP_REFERER")
    bot_token = '8193385627:AAHmm-KIszSsL89dkiyhJF7ZS6OSCaxnbj0'
    chat = '726803747'
    # chat_id = ['549727261', '726803747']
    # for chat in chat_id:
    #     continue
    bot = Bot(token=bot_token)

    items_text = ""

    if 'items' in order_data and len(order_data['items']) > 0:
        items_text = "\n".join(
            [f"{item['displayName']} - {item['quantity']} шт. x {item['price']} ₽"
             for item in order_data['items']]
        )

    print(f'items_text: {items_text}')
    message = (
        f"Новый заказ!\n"
        f"Имя: {order_data['name']}\n"
        f"Телефон: {order_data['phone']}\n"
        f"Email: {order_data['email']}\n"
        f"Способ доставки: {order_data['deliveryType']}\n"
        f"Город: {order_data.get('city', 'Не указан')}\n"
        f"Комментарий: {order_data.get('message', 'Нет')}\n\n"
        f"Товары:\n{items_text}\n\n"
        f"Итого: {order_data['total']} ₽"
    )

    if 'items' in order_data and len(order_data['items']) > 0:
        message += f"Товары: {items_text}\n\n Итого: {order_data['total']}"
    else:
        message += f"Запрос пришел со страницы 'Оплата и доставка'"

    if 'delivery_page' in referer:
        message = (
            f"📩 Новый запрос с формы доставки!\n"
            f"{order_data['name']}\n"
            f"{order_data['phone']}\n"
            f"{order_data['email']}\n"
            f"{order_data['deliveryType']}\n"
            f"{order_data.get('city', 'Не указан')}\n"
            f"Комментарий: {order_data.get('message', 'Нет')}"
        )

    await bot.send_message(chat_id=chat, text=message)

@csrf_exempt
def create_order(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print(f'load data json: {data}')
            serialize_data = {
                'name': data.get('name', ''),
                'phone': data.get('phone', ''),
                'email': data.get('email', ''),
                'deliveryType': data.get('deliveryType', ''),
                'city': data.get('city', ''),
                'message': data.get('message', ''),
                'items': [
                    {
                        'displayName': item.get('displayName', ''),
                        'quantity': item.get('quantity', 0),
                        'price': item.get('price', 0),
                    }
                    for item in data.get('items', [])
                ],
                'total': data.get('total', 0),
            }
            asyncio.run(send_message_to_telegram(serialize_data, request))
            return JsonResponse({'status': 'success'})
        except Exception as e:
            print(f'Ошибка отправки: {e}')
            return JsonResponse({'status': 'failure', 'message': str(e)})
    else:
        print(f'Ошибка: method not supported')
        return JsonResponse({'status': 'failure', 'message': 'method not supported'})
