let currentUser = null; // Variável global para armazenar os dados do usuário atual

document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://eunburxiqtzftppqvxtr.supabase.co'; // Substitua pela sua URL do Supabase
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bmJ1cnhpcXR6ZnRwcHF2eHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1Njc3MzEsImV4cCI6MjA0MTE0MzczMX0.y-EgwTJ-uEzbLa_bTSzbEN10dSyTVrSJ27zrl51MLKc'; // Substitua pela sua chave de API do Supabase
    const TABLE_NAME = 'atm-dadosMentorBeta';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Função para abreviar o nome
    function abreviarNome(nome, maxLength) {
        if (nome.length <= maxLength) return nome;
        const [primeiroNome, ...sobrenomes] = nome.split(' ');
        if (primeiroNome.length >= maxLength) return primeiroNome.slice(0, maxLength);
        const abreviado = sobrenomes.reduce((acc, sobrenome) => {
            if (acc.length + sobrenome.length + 1 <= maxLength) {
                return `${acc} ${sobrenome.charAt(0)}.`;
            }
            return acc;
        }, primeiroNome);
        return abreviado;
    }

    // Função para buscar dados do Supabase e atualizar o ranking
    async function fetchData() {
        console.log('Iniciando a consulta ao Supabase...');
        let { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*');

        console.log('Resposta completa:', { data, error });

        if (error) {
            console.error('Erro ao consultar o Supabase:', error);
        } else if (data.length === 0) {
            console.warn('Nenhum dado encontrado na tabela workez.');
        } else {
            console.log('Dados recebidos do Supabase:', data);

            // Filtrar os dados que possuem quizProgress
            const validData = data.filter(item => item.quizProgress && item.quizProgress.data && item.quizProgress.data.length > 0);
            console.log('Dados válidos:', validData);

            if (validData.length > 0) {
                const allQuizProgress = validData.flatMap(item => item.quizProgress.data.map(quiz => ({
                    ...quiz,
                    name: abreviarNome(item.quizProgress.name, 15) // Adicionar o nome do usuário ao objeto quiz e abreviar
                })));

                // Ordenar os dados de quizProgress
                const rankedQuizProgress = allQuizProgress.sort((a, b) => {
                    if (b.score === a.score) {
                        return a.timing - b.timing; // Menor tempo primeiro em caso de empate na pontuação
                    }
                    return b.score - a.score; // Maior pontuação primeiro
                }).slice(0, 10); // Limitar aos 10 melhores resultados

                console.log('Rankeamento de quizProgress:', rankedQuizProgress);
                updateRanking(rankedQuizProgress); // Passar os dados rankeados
            } else {
                console.warn('Nenhum dado de quizProgress encontrado.');
            }
        }
    }

    // Função para atualizar o ranking na interface do usuário
    function updateRanking(rankedQuizProgress) {
        const rankingContainer = document.getElementById('rankingContainer');
        rankingContainer.innerHTML = ''; // Limpar o conteúdo anterior

        rankedQuizProgress.forEach((quiz, index) => {
            const rankItem = document.createElement('div');
            rankItem.className = 'rank-item';

            // Adicionar classes específicas para os três primeiros colocados
            if (index === 0) {
                rankItem.classList.add('first');
            } else if (index === 1) {
                rankItem.classList.add('second');
            } else if (index === 2) {
                rankItem.classList.add('third');
            } else {
                rankItem.classList.add('normal');
            }

            rankItem.innerHTML = `
                <span class="rank-position">${index + 1}</span>
                <p class="rank-name">${quiz.name}</p>
                <p class="rank-score">${quiz.score}</p>
                <p class="rank-timing">${quiz.timing}</p>
            `;
            rankingContainer.appendChild(rankItem);
        });

        // Atualizar a posição do usuário atual no ranking
        if (currentUser) {
            const currentUserIndex = rankedQuizProgress.findIndex(quiz => quiz.name === currentUser.name);
            if (currentUserIndex !== -1) {
                document.getElementById('currentUserPosition').textContent = `#${currentUserIndex + 1}`;
            }
        }
    }

    // Função para receber mensagens do site principal
    window.addEventListener('message', (event) => {
        if (event.data.type === 'USER_INFO') {
            const user = event.data.user;
            console.log('Dados do usuário recebidos no iframe:', user);

            // Definir o usuário atual
            currentUser = user;

            // Atualizar a interface do iframe com os dados do usuário
            document.getElementById('currentUserName').textContent = user.name;
            document.getElementById('currentUserEmail').textContent = user.email;
        } else {
            console.log('Mensagem recebida:', event.data);
            console.log('Tipo de mensagem não reconhecido:', event.data.type);
        }
    });

    fetchData();
});