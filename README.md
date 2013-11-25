EXPRESSO MOBILE - WWW
===

Este projeto está na fase final de desenvolvimento, o código ainda NÃO deve ser utilizado em servidores de produção. 

Este repositório é um dos 3 repositórios que fazem parte do projeto do novo Expresso Mobile que está sendo desenvolvido em HTML5 e realiza chamadas para a API do Expresso. 

	1 - expressomobile-www 
		Repositório que contém a parte comum WEB e HTML5 para os outros dois repositórios.

	2 - expressomobile-ios 
		Repositório que contém todo o código fonte em OBJECTIVE-C para a plataforma iOS, mas também tem como sub-projeto o repositório expressomobile-www.

	2 - expressomobile-android 
		Repositório que contém todo o código fonte em Java para a plataforma Android, mas também tem como sub-projeto o repositório expressomobile-www.

		
Projeto desenvolvido por:
    CELEPAR - Companhia de Tecnologia da Informação e Comunicação do Estado do Paraná

Desenvolvedores dos Aplicativos

	- Alexandre Rocha Wendling
	- Jair Gonçalves Pereira Jr
	- Rafael Katayama Gobara


Desenvolvedores da API
	
	- Alexandre Luiz Correia
	- Alexandre Rocha Wendling
	- Anderson Tadayuki Saikawa
	- Jair Gonçalves Pereira Jr
	- Nilton Emilio Buhrer Neto
	- Rafael Katayama Gobara


Biliotecas utilizadas
	
	- Bacbkone
	- RequireJS
	- Underscore
	- jQuery
	- Moment.js
	- PhoneGap
	- iScroll
	- jQuery Dot Dot Dot
	- jQuery XMPP



Como Utilizar como uma Instalação do Expresso Mini

	Para utilizar este código fonte como sendo uma instalação do Expresso Mobile WEB, seu servidor precisa ter o Expresso e uma API instalada.

	1 - git clone https://github.com/ComunidadeExpresso/expressomobile-www.git

	2 - (opcional) Renomeie o arquivo servers.json.config para servers.json (Se não for renomeado o sistema irá buscar a lista de servidores cadastrados diretamente do site da comunidade Expresso Livre)

	3 - (opcional) Altere o conteúdo do arquivo servers.json para conter as informações do(s) seu(s) servidor(es), Não altere as chaves ou o formato do JSON, apenas os valores.

