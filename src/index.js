// const { response, request } = require('express');
const express = require('express');
const { uuid, isUuid } = require('uuidv4');

const app = express();

/**
 * Quando eu utilizo o "app.use()", obrigo a todas as requisições passarem
 * pela função a ser chamada pelo app.use. No caso abaixo, todas as requisições 
 * podem interpretar json.
 */
app.use(express.json());

/**
 * No caso abaixo, obrigo a todas as urls com o padrão abaixo serem interceptadas
 * pela middleware validateProjectId para verificar se o ID informado é válido.
 */
app.use('/projects/:id', validateProjectId);

/**
 * Métodos HTTP:
 * 
 * GET: Utilizado quando queremos buscar informações do back-end.
 * POST: Criar uma informação no back-end.
 * PUT/PATCH: Alterar uma informação no back-end.
 * DELETE: Deletar uma informação no back-end.
 */

/**
 * Tipos de parâmetros:
 * 
 * Query Params: Filtros e paginação
 * Route Params: identificar recursos e atualizar ou deletar
 * Request Body: Conteúdo na hora de criar ou editar um recurso (JSON)
 */

/**
 * Middleware:
 * 
 * É um interceptador de requisições, pode interromper a requisição
 * ou pode alterar dados da requisição.
 */

const projects = []; //Armazena a lista de projetos.

function logRequests(request, response, next) {
    const { method, url } = request;

    const logLabel = `[${method.toUpperCase()}] ${url}`;

    console.time(logLabel);
    console.log(logLabel);

    // return next(); //chama a próxima middleware
    /**
     * posso executar o next como função sem precisar do return (return next();),
     * caso eu queira executar outra rota após o next()
     * */

    next();

    console.timeEnd(logLabel);
}

/**
 * Função que será utilizada como middleware para
 * validação dos IDs recebidos nas requisições.
 */
function validateProjectId(request, response, next) {
    const { id } = request.params;

    if (!isUuid(id)) {
        return response.status(400).json({ error: 'invalid project ID.' });
    }
}

/**
 * Na linha abaixo, todos os requests recebidos são obrigados a passar 
 * pela middleware abaixo, também posso comentar a linha abaixo e usar
 * a middleware apenas na rota que eu quiser.
 * 
 * VER A ROTA DE CONSULTA DE PROJETOS COMO EXEMPLO DE USO DE MIDDLEWARES***
 * 
 * Posso usar quantas middlewares eu quiser dentro da mesma rota.
 */
// app.use(logRequests);

app.get('/projects', logRequests, (request, response) => {
    //pegando toda a query de uma vez
    // const query = request.query;

    //desestruturando a query:
    // const { title, owner } = request.query;

    // console.log(title);
    // console.log(owner);

    // return response.json([ 
    //     'Project 1',
    //     'Project 2'
    // ]);

    //filtro de busca
    const { title } = request.query;
    const results = title ? projects.filter(project => project.title.includes(title)) : projects;
    return response.json(results);
});

app.post('/projects', (request, response) => {
    //pegando toda a requisição
    // const body = request.body;

    //desestruturando a requisição
    const { title, owner } = request.body;

    const project = { id: uuid(), title, owner };

    projects.push(project);

    return response.json(project);
});

app.put('/projects/:id', (request, response) => {
    //pegando todos os params
    // const params = request.params;

    //desestruturando o params
    const { id } = request.params;
    const { title, owner } = request.body;

    const projectIndex = projects.findIndex(project => project.id === id);

    if (projectIndex < 0) {
        return response.status(400).json({ error: 'Project not found.' });
    }

    const project = {
        id,
        title,
        owner,
    };

    projects[projectIndex] = project;

    return response.json(project);
});

app.delete('/projects/:id', (request, response) => {
    const { id } = request.params;

    const projectIndex = projects.findIndex(project => project.id === id);

    if (projectIndex < 0) {
        return response.status(400).json({ error: 'Project not found.' });
    }

    projects.splice(projectIndex, 1);

    return response.status(204).send();
});

app.listen(3333, () => {
    console.log("Back-end started! (●'◡'●)"); //Dá até pra inserir emojis!
});