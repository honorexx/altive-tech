# ALTIVE Tech

Site institucional da ALTIVE, uma parceira de tecnologia para negócios: entendemos o problema da empresa antes de propor sites, sistemas, automação, IA ou dados como solução.

## Páginas

- `index.html` — posicionamento, dores comuns, método, soluções, processo e contato
- `solucoes.html` — detalhamento das soluções
- `como-trabalhamos.html` — processo consultivo e formas de trabalhar juntos (sem preços/pacotes)
- `projetos.html` — estrutura de portfólio, com placeholders "Em breve" até existirem cases reais
- `planos.html` — redirect para `como-trabalhamos.html` (mantido por compatibilidade de SEO)

> `css/index.css`, `css/planos.css`, `css/professional.css`, `css/solucoes.css`, `css/style.css` e os arquivos correspondentes em `java/` (exceto `site.js`) são resíduos de iterações visuais anteriores e não são carregados por nenhuma página atual — apenas `css/site.css` e `java/site.js` estão em uso.

## Executar localmente

O projeto é estático e não exige instalação de dependências. Inicie um servidor local na raiz do projeto:

```bash
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Estrutura

```text
assets/   identidade visual e imagens
css/      estilos globais e específicos
java/     interações e animações
*.html    páginas públicas
```

## Fluxo de contribuição

1. Crie uma branch a partir de `main`: `feat/nome-da-melhoria` ou `fix/nome-do-ajuste`.
2. Faça commits pequenos e objetivos seguindo Conventional Commits.
3. Abra um pull request com descrição, evidências visuais e passos de validação.
4. Faça o merge somente após revisão e validação.

### Padrão de commits

- `feat:` nova funcionalidade ou melhoria visível
- `fix:` correção de comportamento
- `style:` ajuste visual sem mudança funcional
- `docs:` documentação
- `chore:` manutenção do projeto

## Contato

- [Site](https://altivetech.com.br/)
- [Instagram](https://www.instagram.com/altivetech/)
- [WhatsApp](https://wa.me/5541984801999)

© 2026 ALTIVE. Todos os direitos reservados.
