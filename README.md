# 📊 PCJ - GEIA - Pessoas desaparecidas

Este projeto é um painel administrativo desenvolvido para visualização e análise de ocorrências de pessoas desaparecidas, integrando-se com a **API de pessoas desaparecidas.** da PCJ - MT.

📌 **Autor:** **LUIZ FERNANDO DA MOTA CARVALHO**

## 🚀 Tecnologias Utilizadas

- **Vue 3** – Framework principal do front-end.
- **Pinia** – Nova store para gerenciamento de estado reativo.
- **Tailwind CSS** – Estilização rápida e responsiva.
- **Node.js 20** – Versão recomendada do Node para rodar o projeto.

## 📦 Instalação Local

Clone o repositório e instale as dependências:

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/abitus-dashboard.git

# Entrar na pasta
cd abitus-dashboard

# Instalar dependências
npm install
```

## ▶️ Executando o Projeto

### Ambiente de Desenvolvimento Local

```bash
npm run dev
```

O projeto ficará disponível em:

```
http://localhost:5173
```

### Ambiente com Docker Compose (Desenvolvimento)

Você também pode rodar a aplicação usando **Docker Compose**, sem precisar instalar Node.js localmente:

```bash
docker-compose up app
```

A aplicação estará disponível em:

```
http://localhost:5173
```

## 🛠️ Build para Produção

```bash
npm run build
```

Os arquivos finais estarão na pasta `dist/`.

## 🌐 API de Integração

O projeto consome os dados da API Abitus. A documentação dos endpoints pode ser consultada no Swagger:

👉 [Abitus API - Swagger](https://abitus-api.geia.vip/swagger-ui/index.html#/ocorrencia-resource/buscarInformacoes)

Exemplo de endpoint utilizado:

```
GET /pessoas/{id}
```

## 📖 Estrutura Básica do Projeto

```
📂 src
 ┣ 📂 components   # Componentes reutilizáveis (Card, Charts, etc.)
 ┣ 📂 composables  # Funções auxiliares reutilizáveis
 ┣ 📂 stores       # Pinia Stores (estado global)
 ┣ 📂 plugins      # Instalação de externos (axios)
 ┣ 📂 views        # Páginas principais do dashboard
 ┣ 📂 services     # Comunicação com a API
 ┗ 📜 main.js      # Arquivo principal da aplicação
```

## ✅ Requisitos

- Node.js >= 20 (caso rode sem Docker)
- npm >= 9 (caso rode sem Docker)
- Docker e Docker Compose (caso queira rodar conteinerizado)
