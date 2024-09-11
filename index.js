// Função para definir o src do iframe dinamicamente
async function setIframeSrc() {
    const id = getJwtSubFromCookie('token'); // Supondo que 'token' é o nome do cookie contendo o JWT
    if (!id) {
        console.error('JWT token not found in cookies.');
        return;
    }

    console.log('ID extraído do JWT:', id); // Log do ID extraído do JWT

    const developerToken = 'ec5dd35e-35df-4053-99de-27eb38d29225';
    const platformToken = 'c525ab94-793e-4fc1-971a-bc0a66b7f58f';

    const user = await fetchUserById(id, developerToken, platformToken);
    
    if (!user) {
        console.error('User not found.');
        return;
    }

    // Defina constantes para armazenar o nome e o email do usuário
    const userName = user.name;
    const userEmail = user.email;

    // Exibir o nome e o email do usuário no console
    console.log('User name:', userName);
    console.log('User email:', userEmail);

    // Atualizar a seção "Você" com o nome e o email do usuário logado
    updateCurrentUserSection(userName, userEmail);

    // Enviar o nome, email e ID de volta para o iframe com nomes diferentes
    const iframe = document.getElementById('quizIframe');
    iframe.contentWindow.postMessage({ type: 'USER_INFO', userId: user.id, userName: userName, userEmail: userEmail }, '*');
}

// Função para atualizar a seção "Você" com o nome e o email do usuário logado
function updateCurrentUserSection(name, email) {
    console.log('Atualizando a seção "Você"...');
    console.log('Nome do usuário:', name);
    console.log('Email do usuário:', email);
}

// Função para receber mensagens da página pai
window.addEventListener('message', (event) => {
    if (event.data.type === 'USER_INFO') {
        const userName = event.data.userName;
        const userEmail = event.data.userEmail;
        const userId = event.data.userId;
        console.log(`Recebido nome do usuário: ${userName}`);
        console.log(`Recebido email do usuário: ${userEmail}`);
        console.log(`Recebido ID do usuário: ${userId}`);

        // Atualizar o ranking com o nome e o email do usuário
        updateRankingWithUserInfo(userId, userName, userEmail);

        // Atualizar a seção "Você" com o nome do usuário logado
        updateCurrentUserSection(userName, userEmail);
    }
});

// Função para atualizar o ranking com o nome e o email do usuário
function updateRankingWithUserInfo(id, name, email) {
    // Atualize o ranking com o nome e o email do usuário
    const rankItem = userIdToRankItemMap.get(id);
    if (rankItem) {
        const rankName = rankItem.querySelector('p');
        rankName.textContent = name || 'Anônimo';
    }
}

// Chamar a função para definir o src do iframe
setIframeSrc();