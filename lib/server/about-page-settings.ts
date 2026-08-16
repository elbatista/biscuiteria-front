import { unstable_noStore as noStore } from "next/cache";

import { prisma } from "@/lib/prisma";

export const ABOUT_PAGE_DEFAULTS = {
  id: 1,

  authorBadge: "Sobre a autora",
  authorTitle: "Oi! Eu sou a Eliadi 👋",
  authorDescription1:
    "Eu crio peças em biscuit com um objetivo simples: transformar momentos em lembranças que dão vontade de guardar. Cada encomenda passa por um processo artesanal — do modelado à pintura — com atenção aos detalhes e muito carinho.",
  authorDescription2:
    "Sou **gaúcha**, apaixonada por **chimarrão**, daqueles que acompanham o dia inteiro. Gosto de enfeitar a cuia, cuidar dos detalhes e aproveitar essa **tradição** ao lado do meu marido, Emerson. Acho que esse cuidado, essa pausa e esse afeto acabam aparecendo também nas minhas peças.",
  authorHighlight: "**Bora tomar um chima!**",

  authorImageMainUrl: "/autora/autora-1.jpeg",
  authorImageMainAlt: "Foto da autora da Biscuit_eria",

  authorImageSecondUrl: "/autora/autora-2.jpeg",
  authorImageSecondAlt: "Bastidores: modelando uma peça em biscuit",

  authorImageThirdUrl: "/autora/autora-4.jpeg",
  authorImageThirdAlt: "Bastidores: pintura e detalhes de acabamento",

  brandBadge: "Sobre a Biscuit_eria",
  brandTitle: "Artesanato que vira lembrança",
  brandDescription1:
    "A **Biscuit_eria** nasceu do desejo de transformar momentos em pequenas peças cheias de significado. Cada encomenda é feita à mão, com calma e atenção aos detalhes — do primeiro rascunho até a embalagem final.",
  brandDescription2:
    "Entre um chimarrão e outro, vou modelando ideias com calma. Esse cuidado com o tempo e com os detalhes também faz parte do meu processo criativo.",

  makerName: "Eliadi",
  city: "São Leopoldo / RS",
  sinceText: "desde 2021",

  historyEyebrow: "Nossa história",
  historyTitle: "De ideia a peça: um processo com carinho",
  historySubtitle:
    "Um pouco do que inspira o trabalho e como as encomendas ganham vida.",
  historyDescription1:
    "Tudo começou em torno do **chimarrão**. Entre uma cuia e outra, fui percebendo que os presentes mais especiais são aqueles que contam uma **história e carregam afeto**. A tradição do mate, tão presente no meu dia a dia, despertou a vontade de criar enfeites para chimarrão, peças que deixassem esse momento ainda mais bonito e cheio de significado.",
  historyDescription2:
    "A partir daí, o **biscuit** virou a matéria-prima perfeita para transformar ideias em **enfeites, acessórios e detalhes para chimarrão**, além de miniaturas e lembranças personalizadas. Cada peça é feita à mão, com calma, delicadeza e atenção ao acabamento — do jeitinho que acredito que o artesanal deve ser. Assim, consigo adaptar cada encomenda para o que você realmente quer, sem “cara de produto pronto”.",

  metaTitle: "Sobre | Biscuit_eria",
  metaDescription:
    "Conheça a história da Biscuit_eria, o cuidado por trás das peças artesanais em biscuit e como funciona o processo de criação.",
} as const;

export async function getAboutPageSettings() {
  noStore();

  return prisma.aboutPageSettings.upsert({
    where: {
      id: 1,
    },
    update: {},
    create: ABOUT_PAGE_DEFAULTS,
  });
}