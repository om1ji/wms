import asyncio
import logging
import os
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton
from fastapi import FastAPI, Request
import uvicorn
from handlers import callbacks, commands

load_dotenv()

logging.basicConfig(level=logging.INFO)

bot = Bot(token=os.getenv("TELEGRAM_BOT_TOKEN"))
dp = Dispatcher()

callbacks.bot = bot

dp.include_router(callbacks.router)
dp.include_router(commands.router)

app = FastAPI()

@dp.message(CommandStart())
async def command_start_handler(message: Message) -> None:
    await message.answer(f"Привет, {message.from_user.full_name}! Я бот для управления заказами.")

async def send_order_notification(order_data):
    chat_id = os.getenv("TELEGRAM_GROUP_ID")
    
    text = f"""
🚚 *Новый заказ!* 🚚

📦 *Склад:* {order_data.get('warehouse_name', 'Не указан')}

📏 *Размер коробок:* {order_data.get('box_size', 'Не указан')}
🔢 *Количество коробок:* {order_data.get('box_count', 'Не указано')}

🎁 *Количество паллетов:* {order_data.get('pallet_count', 'Не указано')}
🎁 *Вес паллеты:* {order_data.get('pallet_weight', 'Не указано')}

🏢 *Компания:* {order_data.get('company_name', 'Не указана')}
👨‍💼 *Контактное лицо:* {order_data.get('client_name', 'Не указан')}
📧 *Email:* {order_data.get('client_email', 'Не указан')}
📱 *Телефон:* {order_data.get('client_phone', 'Не указан')}
💰 *Стоимость груза:* {order_data.get('cost', 'Не указана')} ₽

📝 *Комментарии:* {order_data.get('comments', 'Нет комментариев')}
    """
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="✅ Принять", callback_data=f"order_accept_{order_data.get('order_id')}_{order_data.get('telegram_user_id')}"),
            InlineKeyboardButton(text="❌ Отклонить", callback_data=f"order_reject_{order_data.get('order_id')}_{order_data.get('telegram_user_id')}")
        ]
    ])
    
    await bot.send_message(chat_id=chat_id, text=text, parse_mode=ParseMode.MARKDOWN, reply_markup=keyboard)

# Эндпоинт для приема уведомлений
@app.post("/api/send_notification")
async def send_notification(request: Request):
    try:
        order_data = await request.json()
        await send_order_notification(order_data)
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Error sending notification: {str(e)}")
        return {"status": "error", "message": str(e)}

# Запуск FastAPI сервера вместе с ботом
async def main() -> None:
    # Запускаем бота
    bot_task = asyncio.create_task(dp.start_polling(bot))
    
    # Запускаем FastAPI сервер
    config = uvicorn.Config(app, host="0.0.0.0", port=8080)
    server = uvicorn.Server(config)
    await server.serve()

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    asyncio.run(main())