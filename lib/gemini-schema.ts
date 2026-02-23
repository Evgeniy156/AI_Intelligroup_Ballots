export const GEMINI_RESPONSE_SCHEMA = {
  type: "object" as const,
  properties: {
    isStartPage: {
      type: "boolean" as const,
      description: "true if the page contains the ballot header 'РЕШЕНИЕ собственника' and owner info fields",
    },
    lastName: { type: "string" as const, description: "Фамилия собственника (handwritten)" },
    firstName: { type: "string" as const, description: "Имя собственника (handwritten)" },
    middleName: { type: "string" as const, description: "Отчество собственника (handwritten)" },
    roomNo: { type: "string" as const, description: "Номер квартиры / помещения (handwritten)" },
    area: { type: "string" as const, description: "Площадь помещения в кв.м (handwritten)" },
    snils: { type: "string" as const, description: "СНИЛС — 11 цифр из ячеек (handwritten)" },
    ownershipShare: { type: "string" as const, description: "Доля в праве собственности (handwritten)" },
    questions: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          number: { type: "integer" as const, description: "Номер вопроса повестки" },
          text: { type: "string" as const, description: "Полный текст вопроса" },
          vote: {
            type: "string" as const,
            enum: ["ЗА", "ПРОТИВ", "ВОЗДЕРЖАЛСЯ"],
            description: "Отметка голосования. Null если нет отметки.",
            nullable: true,
          },
        },
        required: ["number", "text", "vote"],
      },
    },
  },
  required: [
    "isStartPage",
    "lastName",
    "firstName",
    "middleName",
    "roomNo",
    "area",
    "snils",
    "ownershipShare",
    "questions",
  ],
}

export const SYSTEM_PROMPT = `Ты — специализированная система распознавания бюллетеней голосования собственников помещений многоквартирного дома. Проанализируй предоставленное изображение отсканированного бюллетеня и извлеки все данные.

ПРАВИЛА:
1. Поле isStartPage = true, если на странице есть заголовок "РЕШЕНИЕ собственника" (или аналогичный заголовок бюллетеня) и поля для ФИО. Иначе false.
2. Извлекай ТОЛЬКО рукописный текст из полей: ФИО (фамилия, имя, отчество), номер квартиры/помещения, площадь, СНИЛС, доля собственности.
3. СНИЛС — строго 11 цифр. Если есть квадратные ячейки, прочитай каждую цифру из них.
4. Для каждого вопроса повестки определи: порядковый номер, полный текст вопроса (как напечатан в бюллетене), и отметку голосования.
5. Отметка голосования — определи какой вариант отмечен галочкой/крестиком: "ЗА", "ПРОТИВ" или "ВОЗДЕРЖАЛСЯ". Если ни один вариант не отмечен — верни null.
6. Если данные нечитаемы или отсутствуют — верни пустую строку для текстовых полей.
7. Если страница не содержит полей ФИО (это продолжение бюллетеня с вопросами), установи isStartPage = false и оставь поля ФИО пустыми.

Верни ответ СТРОГО в JSON формате согласно указанной схеме.`
