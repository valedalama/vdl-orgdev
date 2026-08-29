# Sistema de Governança da Vale da Lama

Este repositório é a casa do Sistema de Governança da **Quinta Vale da Lama, Lda.** — o Manual de
Governança, o mapa da organização e a estrutura em Notion que está por trás dos dois.

*(In English: [README.md](README.md).)*

---

## Comece aqui

**Se é a primeira vez que abre esta página, leia por esta ordem:**

| | Documento | Para quê |
|---|---|---|
| 1 | **[01. Quem Somos](handbook/pt/01_Quem_Somos.md)** | Propósito, Missão, Visão e Valores da Vale da Lama |
| 2 | **[03. Como Estamos Organizados](handbook/pt/03_Como_Estamos_Organizados.md)** | Os Círculos e como se encaixam |
| 3 | **[04. Como Trabalhamos](handbook/pt/04_Como_Trabalhamos.md)** | As reuniões, os Papéis de Círculo e o Registo de Decisões |
| 4 | **[09. Linguagem Comum](handbook/pt/09_Linguagem_Comum.md)** | O glossário. Vale a pena tê-lo aberto ao lado |

**Se é Secretário de um Círculo**, o documento que vai usar todas as semanas é o
**[Manual do Secretário](docs/pt/manual-do-secretario.md)** — o que fazer depois de uma Reunião de
Governança, o que se escreve no Registo de Decisões e onde se registam as alterações.
Há uma versão inglesa em [`docs/en/secretary-manual.md`](docs/en/secretary-manual.md); a
portuguesa é a que conta.

**O Manual completo** está em **[`handbook/pt/`](handbook/pt/)** — dez documentos, do 01 ao 10.
A versão inglesa está em [`handbook/en/`](handbook/en/).

**O mapa da organização** está em **https://valedalama.github.io/vdl-orgdev/** — gerado a partir do
Notion. Leia primeiro o aviso na secção seguinte.

---

## Três coisas que convém saber antes de usar isto

### 1. O Manual está em Markdown, e é essa a versão que conta

Os ficheiros `.md` em `handbook/pt/` **são** o Manual. Os `.docx` são gerados a partir deles, e os
`.pages` e `.pdf` são gerados a partir dos `.docx`. Uma alteração feita num `.docx` não chega ao
Manual — perde-se na geração seguinte.

Se quiser propor uma alteração, há três caminhos e todos servem:

- **Escrever aqui no GitHub** — abrir o ficheiro, carregar no lápis, escrever. O GitHub trata do
  resto e a alteração fica como proposta até alguém a aceitar.
- **Abrir uma Issue** descrevendo o que está errado ou em falta. Não é preciso saber escrever
  Markdown para isto.
- **Dizer a alguém** — por escrito, num documento, num email, numa conversa. Foi assim que se fez
  a última revisão.

O que **não** funciona é editar um `.docx` ou um `.pages` e esperar que a alteração fique.

### 2. O mapa e o Manual ainda não dizem o mesmo

⚠️ O Manual descreve **quatro** Círculos: Âncora, Operações, Casa e Quinta Regenerativa. O mapa,
que é gerado a partir do Notion, mostra **nove**, com nomes diferentes e a dois níveis — e não
mostra o Círculo Âncora.

Isto não é um erro de software. São dois retratos da organização feitos em momentos diferentes: o
Manual descreve a estrutura que decidimos ter, e o Notion guarda a estrutura que ficou registada
até agora. **Reconciliar os dois é uma decisão de governança**, e está na agenda da primeira
Reunião de Governança.

Até lá: **o Manual é o que vale.**

### 3. O Manual é definitivo; a Constituição é a base

Fazemos Holacracy à nossa maneira. Quando é preciso interpretar uma regra, lê-se por esta ordem:

1. **Este Manual** e as Políticas adotadas pelos Círculos.
2. **O Registo de Variações Adotadas** — documento 05.
3. **A [Constituição da Holacracy, versão 5.0](https://www.holacracy.org/constitution/5-0/)**, para
   tudo o que os dois primeiros não resolvam.

Uma divergência entre o Manual e a Constituição que não conste do Registo não é uma regra nova: é
um defeito, e corrige-se. Está explicado no documento 04 e no documento 10.

---

## O que está aqui dentro

| Pasta | O que contém |
|---|---|
| `handbook/pt/` | **O Manual de Governança**, em português. A versão definitiva |
| `handbook/en/` | O Manual em inglês — tradução da versão portuguesa |
| `docs/pt/` | Guias práticos em português, incluindo o Manual do Secretário |
| `docs/` | Documentação técnica, em inglês — para quem administra o Notion |
| `index.html`, `graph.json` | O mapa da organização e os dados que o alimentam |
| `scripts/` | Os programas que geram os documentos e o mapa |
| `archive/` | Material antigo, guardado por história. **Não é referência** |

---

## Perguntas, dúvidas, discordâncias

**[Discussions](https://github.com/valedalama/vdl-orgdev/discussions)** — para perguntas e conversas
abertas. Não é preciso ter a certeza de nada para abrir uma.

**[Issues](https://github.com/valedalama/vdl-orgdev/issues)** — para coisas concretas que estão erradas
ou em falta e alguém tem de resolver.

Se não tem a certeza de qual usar, use Discussions. É mais fácil mover uma conversa do que
recuperá-la.
