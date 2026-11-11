const enderecoAPI = "https://pokeapi.co/api/v2/";
const limitePokemon = 1025;

let pokemonAtual = null;
let somPokemon = null;
let modoBrilhante = false;
let generoAtual = "macho";
let imagensDisponiveis = [];
let indiceImagem = 0;

const campoPesquisa = document.getElementById("campo-pesquisa");
const formularioPesquisa = document.getElementById("formulario-pesquisa");
const painelMensagem = document.getElementById("painel-mensagem");
const mensagem = document.getElementById("mensagem");
const painelInicial = document.getElementById("painel-inicial");
const fichaPokemon = document.getElementById("ficha-pokemon");
const imagemPokemon = document.getElementById("imagem-pokemon");

const regioes = {
    "generation-i": "Kanto",
    "generation-ii": "Johto",
    "generation-iii": "Hoenn",
    "generation-iv": "Sinnoh",
    "generation-v": "Unova",
    "generation-vi": "Kalos",
    "generation-vii": "Alola",
    "generation-viii": "Galar",
    "generation-ix": "Paldea"
};

const nomesEstatisticas = {
    "hp": "HP",
    "attack": "Ataque",
    "defense": "Defesa",
    "special-attack": "Atq. Especial",
    "special-defense": "Def. Especial",
    "speed": "Velocidade"
};

const nomesTipos = {
    normal: "Normal",
    fire: "Fogo",
    water: "Água",
    electric: "Elétrico",
    grass: "Grama",
    ice: "Gelo",
    fighting: "Lutador",
    poison: "Veneno",
    ground: "Terra",
    flying: "Voador",
    psychic: "Psíquico",
    bug: "Inseto",
    rock: "Pedra",
    ghost: "Fantasma",
    dragon: "Dragão",
    dark: "Sombrio",
    steel: "Aço",
    fairy: "Fada"
};

const coresTipos = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    fairy: "#EE99AC"
};

function mostrarMensagem(texto) {
    mensagem.textContent = texto;
    painelMensagem.style.display = "block";
}

function esconderMensagem() {
    painelMensagem.style.display = "none";
    mensagem.textContent = "";
}

function formatarNome(nome) {
    return nome
        .split("-")
        .map(parte => parte.charAt(0).toUpperCase() + parte.slice(1))
        .join(" ");
}

async function consultarAPI(endereco) {
    const resposta = await fetch(endereco);

    if (!resposta.ok) {
        throw new Error("Não foi possível encontrar os dados do Pokémon.");
    }

    return await resposta.json();
}

function escolherImagem(pokemon) {
    const sprites = pokemon.sprites;
    const imagens = [];

    const artwork = sprites.other?.["official-artwork"];

    if (modoBrilhante) {
        if (generoAtual === "femea" && sprites.front_shiny_female) {
            imagens.push(sprites.front_shiny_female);
        }

        if (sprites.front_shiny) {
            imagens.push(sprites.front_shiny);
        }

        if (artwork?.front_shiny) {
            imagens.push(artwork.front_shiny);
        }

        imagens.push(
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png`
        );
    } else {
        if (generoAtual === "femea" && sprites.front_female) {
            imagens.push(sprites.front_female);
        }

        if (sprites.front_default) {
            imagens.push(sprites.front_default);
        }

        if (artwork?.front_default) {
            imagens.push(artwork.front_default);
        }

        imagens.push(
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
        );
    }

    return [...new Set(imagens.filter(Boolean))];
}

function atualizarImagem() {
    if (!pokemonAtual) return;

    imagensDisponiveis = escolherImagem(pokemonAtual);
    indiceImagem = 0;

    if (imagensDisponiveis.length === 0) {
        imagemPokemon.removeAttribute("src");
        imagemPokemon.alt = "Imagem indisponível";
        return;
    }

    imagemPokemon.src = imagensDisponiveis[indiceImagem];
}

imagemPokemon.addEventListener("error", () => {
    indiceImagem++;

    if (indiceImagem < imagensDisponiveis.length) {
        imagemPokemon.src = imagensDisponiveis[indiceImagem];
    }
});

function atualizarBotoesGenero() {
    document.getElementById("botao-macho").classList.toggle(
        "ativo",
        generoAtual === "macho"
    );

    document.getElementById("botao-femea").classList.toggle(
        "ativo",
        generoAtual === "femea"
    );
}

function mostrarTipos(pokemon) {
    const elementoTipos = document.getElementById("tipos-pokemon");
    elementoTipos.innerHTML = "";

    pokemon.types.forEach(item => {
        const tipoOriginal = item.type.name;
        const tipo = document.createElement("span");

        tipo.className = "tipo";
        tipo.textContent = nomesTipos[tipoOriginal] || formatarNome(tipoOriginal);
        tipo.style.backgroundColor = coresTipos[tipoOriginal] || "#64748b";

        elementoTipos.appendChild(tipo);
    });
}

function mostrarEstatisticas(pokemon) {
    const lista = document.getElementById("lista-estatisticas");
    lista.innerHTML = "";

    pokemon.stats.forEach(item => {
        const nomeOriginal = item.stat.name;
        const nome = nomesEstatisticas[nomeOriginal] || nomeOriginal;
        const valor = item.base_stat;

        const linha = document.createElement("div");
        linha.className = "estatistica";

        const nomeElemento = document.createElement("span");
        nomeElemento.className = "nome-estatistica";
        nomeElemento.textContent = nome;

        const barra = document.createElement("div");
        barra.className = "barra-estatistica";

        const progresso = document.createElement("div");
        progresso.className = "progresso-estatistica";

        progresso.style.width = `${Math.min(valor / 255 * 100, 100)}%`;

        barra.appendChild(progresso);

        const valorElemento = document.createElement("span");
        valorElemento.className = "valor-estatistica";
        valorElemento.textContent = valor;

        linha.appendChild(nomeElemento);
        linha.appendChild(barra);
        linha.appendChild(valorElemento);

        lista.appendChild(linha);
    });
}

async function obterRegiao(pokemon) {
    try {
        const especie = await consultarAPI(pokemon.species.url);
        const geracao = especie.generation.name;

        return regioes[geracao] || "Desconhecida";
    } catch (erro) {
        return "Desconhecida";
    }
}

async function exibirPokemon(pokemon) {
    pokemonAtual = pokemon;
    somPokemon = pokemon.cries?.latest || pokemon.cries?.legacy || null;

    painelInicial.style.display = "none";
    fichaPokemon.style.display = "grid";

    document.getElementById("numero-pokemon").textContent =
        `Nº ${String(pokemon.id).padStart(3, "0")}`;

    document.getElementById("nome-pokemon").textContent =
        formatarNome(pokemon.name);

    document.getElementById("altura-pokemon").textContent =
        `${(pokemon.height / 10).toFixed(1)} m`;

    document.getElementById("peso-pokemon").textContent =
        `${(pokemon.weight / 10).toFixed(1)} kg`;

    mostrarTipos(pokemon);
    mostrarEstatisticas(pokemon);
    atualizarImagem();
    atualizarBotoesGenero();

    const regiao = await obterRegiao(pokemon);

    if (pokemonAtual.id === pokemon.id) {
        document.getElementById("regiao-pokemon").textContent = regiao;
    }

    esconderMensagem();
}

async function pesquisarPokemon(termo) {
    const pesquisa = String(termo).trim().toLowerCase();

    if (!pesquisa) {
        mostrarMensagem("Digite o nome ou número de um Pokémon.");
        return;
    }

    if (/^\d+$/.test(pesquisa)) {
        const numero = Number(pesquisa);

        if (numero < 1 || numero > limitePokemon) {
            mostrarMensagem(`Digite um número entre 1 e ${limitePokemon}.`);
            return;
        }
    }

    try {
        mostrarMensagem("Carregando Pokémon...");

        const pokemon = await consultarAPI(
            `${enderecoAPI}pokemon/${encodeURIComponent(pesquisa)}`
        );

        modoBrilhante = false;
        generoAtual = "macho";

        document.getElementById("botao-brilhante").classList.remove("ativo");

        await exibirPokemon(pokemon);

    } catch (erro) {
        fichaPokemon.style.display = "none";
        painelInicial.style.display = "block";

        mostrarMensagem(
            "Não foi possível carregar o Pokémon. Verifique o nome ou número e tente novamente."
        );
    }
}

async function navegarPokemon(numero) {
    if (numero < 1 || numero > limitePokemon) {
        return;
    }

    campoPesquisa.value = numero;
    await pesquisarPokemon(numero);
}

function limparPesquisa() {
    campoPesquisa.value = "";
    campoPesquisa.focus();
}

formularioPesquisa.addEventListener("submit", async evento => {
    evento.preventDefault();
    await pesquisarPokemon(campoPesquisa.value);
});

document.getElementById("botao-limpar").addEventListener("click", () => {
    limparPesquisa();
});

document.getElementById("botao-brilhante").addEventListener("click", () => {
    if (!pokemonAtual) return;

    modoBrilhante = !modoBrilhante;

    document.getElementById("botao-brilhante").classList.toggle(
        "ativo",
        modoBrilhante
    );

    atualizarImagem();
});

document.getElementById("botao-macho").addEventListener("click", () => {
    generoAtual = "macho";
    atualizarBotoesGenero();
    atualizarImagem();
});

document.getElementById("botao-femea").addEventListener("click", () => {
    generoAtual = "femea";
    atualizarBotoesGenero();
    atualizarImagem();
});

imagemPokemon.addEventListener("click", () => {
    if (!somPokemon) return;

    const audio = new Audio(somPokemon);
    audio.play().catch(() => {});
});

document.getElementById("botao-voltar-dez").addEventListener("click", () => {
    if (pokemonAtual) {
        navegarPokemon(pokemonAtual.id - 10);
    }
});

document.getElementById("botao-anterior").addEventListener("click", () => {
    if (pokemonAtual) {
        navegarPokemon(pokemonAtual.id - 1);
    }
});

document.getElementById("botao-proximo").addEventListener("click", () => {
    if (pokemonAtual) {
        navegarPokemon(pokemonAtual.id + 1);
    }
});

document.getElementById("botao-avancar-dez").addEventListener("click", () => {
    if (pokemonAtual) {
        navegarPokemon(pokemonAtual.id + 10);
    }
});

document.querySelectorAll("[data-numero]").forEach(botao => {
    botao.addEventListener("click", () => {
        campoPesquisa.value += botao.dataset.numero;
    });
});

document.querySelector('[data-acao="limpar"]').addEventListener("click", () => {
    campoPesquisa.value = "";
});

document.querySelector('[data-acao="apagar"]').addEventListener("click", () => {
    campoPesquisa.value = campoPesquisa.value.slice(0, -1);
});

document.getElementById("botao-pesquisar-teclado").addEventListener("click", () => {
    pesquisarPokemon(campoPesquisa.value);
});

window.addEventListener("offline", () => {
    mostrarMensagem("Você está sem conexão com a internet.");
});

window.addEventListener("online", () => {
    esconderMensagem();
});