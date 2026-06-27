# Requisitos do Sistema: PTG Balance Tracker (Minimal POC)

Este documento descreve os requisitos simplificados para a criação de uma Prova de Conceito (POC) de um Web App PWA focado exclusivamente no controle financeiro do sistema **Proxy The Gathering Collection**.

## 1. Objetivo
Criar uma ferramenta minimalista e rápida para que o usuário possa registrar créditos (ganhos) e despesas (gastos), visualizando seu saldo atual de forma imediata, sem a necessidade de gerenciar inventários, produtos específicos ou históricos detalhados.

---

## 2. Requisitos Funcionais (RF)

### RF01 – Gestão de Saldo
*   O sistema deve exibir o saldo atual (em R$) de forma centralizada e destacada.
*   O saldo deve ser atualizado automaticamente após cada operação de crédito ou débito.

### RF02 – Registro de Créditos (Ganhos)
*   **Entrada Manual:** O sistema deve oferecer um campo para inserção manual de valor.
*   **Atalhos de Categorias:** Exibir botões de ação rápida para adicionar valores fixos baseados em raridade (R$ 5, 15, 20, 50).
*   **Menu de Atividades (NOVO):** Permitir a seleção de tarefas específicas (ex: "Malhar", "Estudar") que aplicam o bônus automaticamente conforme a categoria.

### RF03 – Registro de Despesas (Gastos)
*   **Entrada Manual:** O sistema deve oferecer um campo para inserção manual de valor.
*   **Atalhos de Produtos (Art. 6º):** Exibir botões de ação rápida para deduzir valores fixos.

### RF04 – Página do Regulamento (NOVO)
*   O sistema deve possuir uma aba ou tela dedicada para exibir as regras do sistema (conteúdo do `Regulamento.md`).

### RF05 – Navegação (NOVO)
*   Interface com navegação simples (ex: abas no rodapé ou cabeçalho) para alternar entre "Saldo" e "Regulamento".

---

## 3. Requisitos Não Funcionais (RNF)

### RNF01 – Natureza PWA (Progressive Web App)
*   O app deve ser instalável em dispositivos móveis e funcionar Offline (armazenamento local).
*   Deve possuir `manifest.json` e Service Worker básico.

### RNF02 – Armazenamento de Dados
*   O saldo deve ser persistido no **LocalStorage** do navegador para que não se perca ao fechar o app.

### RNF03 – Interface (UI/UX)
*   Interface "Clean" e minimalista.
*   **Grid de Ações:** Organizar os botões de atalho em um grid de fácil acesso (ex: cores diferentes para Crédito e Débito).
*   Design responsivo (Mobile First).

---

## 4. Regras de Negócio (RN)
*   **RN01:** O saldo deve ser impedido de ficar negativo, ou o sistema deve exibir um aviso visual crítico caso isso ocorra.
*   **RN02:** Simplicidade total: sem telas de login, sem bancos de dados externos e sem listagem de transações passadas.
