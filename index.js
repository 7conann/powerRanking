let currentUser = null; // Variável global para armazenar os dados do usuário atual

document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://eunburxiqtzftppqvxtr.supabase.co'; // Substitua pela sua URL do Supabase
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bmJ1cnhpcXR6ZnRwcHF2eHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1Njc3MzEsImV4cCI6MjA0MTE0MzczMX0.y-EgwTJ-uEzbLa_bTSzbEN10dSyTVrSJ27zrl51MLKc'; // Substitua pela sua chave de API do Supabase
    const TABLE_NAME = 'atm-dadosMentorBeta';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Função para abreviar o nome
    function abreviarNome(nome, maxLength) {
        if (!nome) return ''; // Verifica se o nome está definido
        if (nome.length <= maxLength) return nome;
        const [primeiroNome, ...sobrenomes] = nome.split(' ');
        if (primeiroNome.length >= maxLength) return primeiroNome.slice(0, maxLength);
        const abreviado = sobrenomes.reduce((acc, sobrenome) => {
            if (acc.length + sobrenome.length + 2 <= maxLength) { // +2 para incluir o espaço e o ponto
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
                    name: abreviarNome(item.quizProgress.name, 20), // Adicionar o nome do usuário ao objeto quiz e abreviar
                    userId: item.id // Adicionar o ID do usuário ao objeto quiz
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

                // Atualizar os dados do usuário atual
                if (currentUser) {
                    const currentUserData = allQuizProgress.find(quiz => quiz.userId === currentUser.id);
                    console.log('Dados do usuário atual:', currentUserData);
                    if (currentUserData) {
                        document.getElementById('currentUserPosition').textContent = `#${rankedQuizProgress.findIndex(quiz => quiz.userId === currentUser.id) + 1}`;
                        document.getElementById('currentUserName').textContent = abreviarNome(currentUserData.name, 20);
                        document.getElementById('currentUserScore').textContent = currentUserData.score;
                        document.getElementById('currentUserTiming').textContent = currentUserData.timing;
                    } else {
                        document.getElementById('currentUserPosition').textContent = '#?';
                        document.getElementById('currentUserScore').textContent = '#?';
                        document.getElementById('currentUserTiming').textContent = '#?';
                    }
                }
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
                <p>${quiz.name}</p>
                <p class="seg">${quiz.score}</p>
                <p class="seg">${quiz.timing}</p>
            `;
            rankingContainer.appendChild(rankItem);
        });
    }

    // Função para receber mensagens do site principal
    window.addEventListener('message', (event) => {
        if (event.data.type === 'USER_INFO') {
            const user = event.data.user;
            console.log('Dados do usuário recebidos no iframe:', user);
            fetchData();
            // Definir o usuário atual
            currentUser = user;

            // Atualizar a interface do iframe com os dados do usuário
            document.getElementById('currentUserName').textContent = abreviarNome(user.name, 20);
            document.getElementById('currentUserEmail').textContent = user.email;

            // Buscar dados do Supabase após definir o usuário atual
        } else {
            console.log('Mensagem recebida:', event.data);
            console.log('Tipo de mensagem não reconhecido:', event.data.type);
        }
    });

    // Buscar dados do Supabase ao carregar a página
    // Removido fetchData() daqui para garantir que só seja chamado após receber USER_INFO
});