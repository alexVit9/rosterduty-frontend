import { ChecklistTemplate } from '../types';
import { saveTemplate } from './storage';

export const seedInitialData = () => {
  // Check if already seeded
  const existing = localStorage.getItem('restaurant_checklist_templates');
  if (existing && JSON.parse(existing).length > 0) {
    return;
  }

  // Seed initial templates
  const templates: ChecklistTemplate[] = [
    {
      id: 'template-1',
      name: 'Утренняя проверка кухни',
      description: 'Ежедневная проверка кухни перед открытием',
      createdAt: new Date().toISOString(),
      items: [
        { id: '1', text: 'Проверка температуры холодильников', category: 'Оборудование' },
        { id: '2', text: 'Проверка температуры морозильных камер', category: 'Оборудование' },
        { id: '3', text: 'Проверка чистоты рабочих поверхностей', category: 'Санитария' },
        { id: '4', text: 'Проверка чистоты плиты и духовки', category: 'Санитария' },
        { id: '5', text: 'Наличие моющих средств', category: 'Инвентарь' },
        { id: '6', text: 'Наличие одноразовых перчаток', category: 'Инвентарь' },
        { id: '7', text: 'Проверка срока годности продуктов', category: 'Продукты' },
        { id: '8', text: 'Проверка наличия свежих овощей', category: 'Продукты' },
      ],
    },
    {
      id: 'template-2',
      name: 'Проверка зала перед открытием',
      description: 'Подготовка зала к приему гостей',
      createdAt: new Date().toISOString(),
      items: [
        { id: '9', text: 'Чистота столов', category: 'Санитария' },
        { id: '10', text: 'Чистота стульев', category: 'Санитария' },
        { id: '11', text: 'Наличие салфеток на столах', category: 'Сервировка' },
        { id: '12', text: 'Наличие меню на столах', category: 'Сервировка' },
        { id: '13', text: 'Проверка освещения', category: 'Оборудование' },
        { id: '14', text: 'Проверка кондиционера', category: 'Оборудование' },
        { id: '15', text: 'Чистота полов', category: 'Санитария' },
        { id: '16', text: 'Чистота туалетов', category: 'Санитария' },
      ],
    },
    {
      id: 'template-3',
      name: 'Закрытие смены',
      description: 'Проверка перед закрытием ресторана',
      createdAt: new Date().toISOString(),
      items: [
        { id: '17', text: 'Выключено все оборудование', category: 'Безопасность' },
        { id: '18', text: 'Закрыты все краны', category: 'Безопасность' },
        { id: '19', text: 'Вынесен мусор', category: 'Санитария' },
        { id: '20', text: 'Убраны полы в зале', category: 'Санитария' },
        { id: '21', text: 'Убрана кухня', category: 'Санитария' },
        { id: '22', text: 'Закрыты окна', category: 'Безопасность' },
        { id: '23', text: 'Включена сигнализация', category: 'Безопасность' },
      ],
    },
  ];

  templates.forEach(template => saveTemplate(template));
};
