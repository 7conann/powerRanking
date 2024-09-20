let currentUser = null; // Variável global para armazenar os dados do usuário atual

document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://eunburxiqtzftppqvxtr.supabase.co'; // Substitua pela sua URL do Supabase
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bmJ1cnhpcXR6ZnRwcHF2eHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1Njc3MzEsImV4cCI6MjA0MTE0MzczMX0.y-EgwTJ-uEzbLa_bTSzbEN10dSyTVrSJ27zrl51MLKc'; // Substitua pela sua chave de API do Supabase
    const TABLE_NAME = 'atm-dadosMentorBeta';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Função para buscar dados do Supabase e atualizar o ranking
    async function fetchData() {
        let { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*');


        if (error) {
            console.error('Erro ao consultar o Supabase:', error);
        } else if (data.length === 0) {
            console.warn('Nenhum dado encontrado na tabela workez.');
        }
        console.log(data);
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
            fetchData();
            // Definir o usuário atual
            currentUser = user;

            console.log('Usuário atual:', currentUser);
            console.log('Nome do usuário:', currentUser.name);
            // Buscar dados do Supabase após definir o usuário atual
        } else {
           
        }
    });

    // Buscar dados do Supabase ao carregar a página
    // Removido fetchData() daqui para garantir que só seja chamado após receber USER_INFO
});