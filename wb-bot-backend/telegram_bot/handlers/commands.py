from aiogram import Router
from aiogram.types import Message
from aiogram.filters import Command
import logging

router = Router()
logger = logging.getLogger(__name__)

@router.message(Command("help"))
async def cmd_help(message: Message):
    help_text = """
Доступные команды:
/start - Начать работу с ботом
/help - Показать справку
    """
    await message.answer(help_text)
