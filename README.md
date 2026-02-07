# GeoDB Cities Clustering

Aplicação para a visualização e agrupamento (clustering) de cidades utilizando o algoritmo **K-Means**. Os dados são obtidos a partir da API **GeoDB Cities (RapidAPI)** e processados no navegador com suporte a **Web Workers** para não bloquear a interface.

O sistema permite:
- Buscar cidades via API externa com paginação  
- Buscar cidades por nome
- Selecionar subconjuntos de cidades  
- Executar o algoritmo de clusterização K-Means  
- Visualizar a distribuição das cidades nos clusters  

O projeto foi desenvolvido para fins de aprendizado com foco em:
- Consumo de APIs externas  
- Processamento de dados no cliente
- Lógica funcional  
- Paralelismo com Web Workers  
- Visualização e análise de agrupamentos  

---

## Tecnologias utilizadas

**Frontend**
- Vite  
- JavaScript (ES Modules)  
- Web Workers  
- Fetch API  

**Backend**
- Node.js  
- Express    

**Infraestrutura**
- Docker    

**API Externa**
- GeoDB Cities API (RapidAPI)

---

## Estrutura do projeto
```env
├── public/              # Arquivos estáticos  
├── src/                 # Lógica principal do frontend
│   ├── clustering/      # Implementação do K-Means
│   ├── workers/         # Web Workers para processamento paralelo
│   ├── services/        # Comunicação com API
│   ├── state/           # Gerenciamento de estado da aplicação
│   ├── utils/           # Funções utilitárias
│   └── view/            # Interface
├── server/              # Backend 
│   └── index.js         # Servidor e proxy para a API, JSON
│   └── data/            # Repositório de cidades carregadas 
├── docker-compose.yml
```
---

## Instalação e Execução

### Requisitos

- Docker  
- Docker Compose  
- Chave de API válida da **GeoDB Cities (RapidAPI)**  

---

### Configurar variáveis de ambiente

A chave da API **não está incluída** no repositório.  
É necessário criar o arquivo `.env` manualmente na raiz do projeto.

#### Na raiz do projeto

1 . Crie um arquivo `.env` baseado em `.env.example`:

```env
VITE_API_KEY=SUA_CHAVE_RAPIDAPI_AQUI
```
### Subir a aplicação
1 . Na raiz do projeto, execute com Docker:

```env
docker compose up --build
```
2. Acessar a aplicação <br><br>
Após os containers iniciarem acesse: http://localhost:5173

  
