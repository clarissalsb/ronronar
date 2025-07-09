<div align="center" name="inicio">
 <a href="*"><img title="Logo Projeto Ronronar" src="Imagens/Logo Projeto Ronronar.jpg" style="width:300px;" />
 </a>
</div>

###### **Keywords**: Projeto Integrado - Equipe Ronronar - Sistemas e Mídias Digitais - Universidade Federal do Ceará

<h5>
    Sumário:
    <a href="#sobre">Sobre</a> •
    <a href="#equipe">Equipe</a> •
    <a href="#rodar">Como rodar</a> •
    <a href="#tecnologias">Tecnologias utilizadas</a> •
    <a href="#requisitos">Requisitos funcionais</a> •
    <a href="#documento">Relatório </a> •
    <a href="#license"> Licença</a> • 
</h5>

<a name="sobre"></a>

 ## Sobre o projeto

 Seja bem vindo ao repositório do Projeto Ronronar! Um local com o intuito de abrigar e organizar os arquivos para os trabalhos desenvolvidos durante a disciplina de Projeto Integrado I do curso Sistemas e Mídias Digitais da Universidade Federal do Ceará (UFC). Criado com o intuito de auxiliar a ONG com o mesmo nome, o Projeto Ronronar começou a atuar em 10 de Abril de 2025, por meio do nosso primeiro contato com as voluntárias da organização, o grupo Ronronar é uma ONG que realiza o resgate e adoção de animais abandonados, nesse sentido, visamos os auxiliar por meio de uma solução à um dos desafios enfrentados pelo grupo. Dito isso, nossa solução busca, principalmente, dinamizar o processo de apadrinhamento deles, por meio de uma aplicação.

 <div align="center" name="mockups">
  <a href="*"><img title="rascunho da homepage"src="Imagens/Homepage rascunho.jpeg" style="width:200px;"></a>
  <a href="*"><img title="rascunho do login"src="Imagens/Login rascunho.jpeg" style="height:340px;"></a>
 </div>

<a name="equipe"></a>

 ## Equipe Ronronar

 | NOME                                     | FUNÇÃO                 |
 | -----------------------------------------| -----------------------|
 | Antônio Pedro Cayky Do Nascimento Pereira| Programação            |
 | Elias Jeiel Lima de Menezes              | Programação            |
 | Saul de Andrade Guimarães                | Programação            |
 | Brener Gabriel Sousa Vasconcelos         | Design                 |
 | Clarissa Maria Araújoo Inácio            | Líder e Design         |
 | Dávila Michelle Araújo Nascimento        | Design                 |

<a name="rodar"></a>

## Como Rodar

#### Clonando o repositório
```
git clone https://github.com/clarissalsb/ronronar
CD ronronar
```

<a name="tecnologias"></a>

 ## Tecnologias utilizadas

 * **Node.js** + **Express**
 * **Sequelize(ORM)** (SQLite)
 * **Multer** (Upload)
 * **Alpine.js**

<a name="requisitos"></a>

 ## Requisitos funcionais

 |  ID  |           Título            |    Descrição     | Status |
 |------|-----------------------------|------------------|--------|
 | RF01 | Autenticar Usuário          |O usuário deve poder realizar login usando e-mail e senha. O sistema deve manter o usuário autenticado.                  |    ✔️    |
 | RF02 | Cadastrar Usuário           |O usuário deve poder realizar o cadastro com nome, e-mail e senha. O sistema deve checar se o e-mail já está em uso.                  |    ✔️    |
 | RF03 | Remover Usuário             |A voluntária deve poder remover usuários inativos          |    ✔️    |
 | RF04 | Editar Dados                |O usuário deve ser capaz de alterar sua senha, no cenário em que ele esqueça seus dados, por meio de um processo de recuperação.                  |        |
 | RF05 | Função de Admin               |O sistema deve permitir que administradores gerenciem usuários.                  |    ✔️    |
 | RF06 | Cadastrar pet             |O usuário deve ser capaz de inserir e armazenar dados do pet, como registros médicos, peso e idade.                  |        |
 | RF07 | Editar dados do pet            |As voluntárias devem ser capazes de alterar dados do pet, como idade, peso e registros médicos.              |        |
 | RF08 | Inserir Imagens            |O usuário deve ser capaz de enviar imagens para a aplicação.                |        |
 | RF09 | Remover imagens         |O usuário deve ser capaz de remover imagens antigas do pet, para inserir imagens novas.                  |        |
 | RF10 | Apadrinhamento de pets             |O sistema deve permitir o vínculo de um padrinho a um ou mais pets, armazenando os dados do padrinho e seu histórico de apadrinhamento.                     |        |
 | RF11 | Listar pets disponíveis para apadrinhamento      |O sistema deve exibir uma lista de pets disponíveis para apadrinhamento, com dados básicos e imagens para atrair novos padrinhos.                    |        |
 | RF12 | Envio de relatórios         |O sistema deve permitir o envio de atualizações ou relatórios sobre o pet apadrinhado ao respectivo padrinho, via e-mail ou sistema                    |        |          
 | RF13 | Controlar doações      | O sistema deve permitir o registro de doações, com dados como valor, data, forma de doação e nome do doador (opcional).                    |        |                   

<a name="documento"></a>

## Relatório

O relatório do processo e dos dados coletados podem ser encontrados em 
https://docs.google.com/document/d/1Gmaj_xU2skCxmeZbeG9Y4FVPVd0U3cdr/edit

<a name="license"></a>

## Licença

Esse projeto atua sob a GNU GPLv3.
