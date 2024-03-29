const URL = 'http://localhost:3400/produtos'

let listaProdutos = [];
let btnAdicionar = document.querySelector('#btn-adicionar');
let tabelaProdutos = document.querySelector('table>tbody');
let modalProdutos = new bootstrap.Modal(document.getElementById('modal-produto'));

let formModal = {
    id: document.querySelector("#id"),
    nome: document.querySelector("#nome"),
    valor: document.querySelector("#valor"),
    quantidadeEstoque: document.querySelector("#quantidadeEstoque"),
    observacao: document.querySelector("#observacao"),
    dataCadastro: document.querySelector("#dataCadastro"),
    btnSalvar:document.querySelector("#btn-salvar"),
    btnCancelar:document.querySelector("#btn-cancelar")
}


btnAdicionar.addEventListener('click', () =>{
    limparModalProdutos();
    modalProdutos.show();
});

// Obter os produtos da API
function obterProdutos() {
    fetch(URL, {
        method: 'GET',
        headers: {
            'Authorization' : obterToken()
        }
    })
    .then(response => response.json())
    .then(produtos => {
        listaProdutos = produtos;
        popularTabela(produtos);
    })
    .catch((erro) => {});
}

obterProdutos();

function popularTabela(produtos){

    // Limpando a tabela para popular
    tabelaProdutos.textContent = '';

    produtos.forEach(produto => { 
        criarLinhaNaTabela(produto);
    });
}

function criarLinhaNaTabela(produto){

    //1° Criando um tr, é uma linha na tabela.
    let tr  = document.createElement('tr');

    //2° Criar as tds dos conteudos da tabela
    let  tdId = document.createElement('td');
    let  tdNome = document.createElement('td');
    let  tdQuantidadeEstoque = document.createElement('td');
    let  tdObservacao = document.createElement('td');
    let  tdValor = document.createElement('td');
    let  tdDataCadastro = document.createElement('td');
    let  tdAcoes = document.createElement('td');

    // 3° Atualizar as tds com base no produto
    tdId.textContent = produto.id
    tdNome.textContent = produto.nome;
    tdObservacao.textContent = produto.observacao;
    tdQuantidadeEstoque.textContent = produto.quantidadeEstoque;
    tdValor.textContent = produto.valor;
    tdDataCadastro.textContent = new Date(produto.dataCadastro).toLocaleDateString();
    tdAcoes.innerHTML = `<button onclick="editarProduto(${produto.id})" class="btn btn-outline-primary btn-sm mr-3">
                                Editar
                            </button>
                            <button onclick="excluirProduto(${produto.id})" class="btn btn-outline-primary btn-sm mr-3">
                                Excluir
                        </button>`

    // 4° Adicionando as TDs à Tr
    tr.appendChild(tdId);
    tr.appendChild(tdNome);
    tr.appendChild(tdValor);
    tr.appendChild(tdQuantidadeEstoque);
    tr.appendChild(tdObservacao);
    tr.appendChild(tdDataCadastro);
    tr.appendChild(tdAcoes);

    // 5° Adicionar a tr na tabela.
    tabelaProdutos.appendChild(tr);
}


formModal.btnSalvar.addEventListener('click', () => {

    // 1° Capturar os dados da tela do modal e transformar em um produto
    let produto = obterProdutoDoModal();

    // 2° Verificar se os campos obrigatorios foram preenchidos

    if(!produto.validar()){
        alert("Nome e Preço são obrigatórios.");
        return;
    }

    // 3° Adicionar na api - Backend
    adicionarProdutoNoBackend(produto);
});


function obterProdutoDoModal(){
    return new Produto({
        id: formModal.id.value,
        valor: formModal.valor.value,
        nome: formModal.nome.value,
        quantidadeEstoque: formModal.quantidadeEstoque.value,
        observacao: formModal.observacao.value,
        dataCadastro: (formModal.dataCadastro.value)
            ? new Date(formModal.dataCadastro.value).toISOString()
            : new Date().toISOString()
    });
}

function adicionarProdutoNoBackend(produto){

    fetch(URL, {
        method: 'POST',
        headers: {
            Authorization: obterToken(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(produto)
    })
    .then(response => response.json())
    .then(response => {
        let novoProduto = new Produto(response);
        listaProdutos.push(novoProduto);

        popularTabela(listaProdutos);

        // Fechar modal
        
        modalProdutos.hide();

        // Mandar mensagem de produto cadastrado com sucesso!
        alert(`Produto ${produto.nome}, foi cadastrado com sucesso!`)
    })
}

function limparModalProdutos(){
    formModal.id.value = '';
    formModal.nome.value = '';
    formModal.valor.value = '';
    formModal.quantidadeEstoque.value = '';
    formModal.observacao.value = '';
    formModal.dataCadastro.value = '';

} 
function excluirProduto(id){
    let produto = listaProdutos.find(produto => produto.id == id);

    if(confirm("Deseja realmente excluir o produto " + produto.nome +'?')){
        excluirProdutoNoBackEnd(id);
    }
}

function excluirProdutoNoBackEnd(id){
    fetch(`${URL}/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: obterToken()
        }
    })
    .then(() => {
        removerProdutoDaLista(id);
        popularTabela(listaProdutos);
    })
}

function removerProdutoDaLista(id){
    let indice = listaProdutos.findIndex(produto => produto.id == id);

    listaProdutos.splice(indice, 1);
}