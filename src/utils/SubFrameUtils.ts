// utils.ts

// Функция для объединения классов с условными добавлениями
export function twClassNames(...args: any[]): string {
  return args
    .filter(Boolean) // Убираем ложные значения
    .map((arg) =>
      typeof arg === "object"
        ? Object.keys(arg)
            .filter((key) => arg[key])
            .join(" ")
        : arg
    )
    .join(" ");
}

// Функция для проверки наличия элемента в массиве
export function isInArray<T>(value: T, array: T[]): boolean {
  return array.includes(value);
}

// Функция для выполнения глубокого клонирования объекта
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Функция для формирования уникального идентификатора
export function generateUniqueId(): string {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// Функция для проверки, является ли строка валидным URL
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Пример создания типа для использования в интерфейсах
export type Maybe<T> = T | null | undefined;
