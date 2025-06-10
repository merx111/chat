const apiKey = '$2a$10$W7r2d0gmDZE45aqzwLFbTumNYrlgnya.eify2ghIr2Ebrf0aupxWu'; // reemplaza con tu API Key
const binId = '68481d5a8a456b7966abc307'; // reemplaza con tu bin ID
const apiUrl = `https://api.jsonbin.io/v3/b/${binId}`;

let username = '';

const registerSection = document.getElementById('register-section');
const chatSection = document.getElementById('chat-section');
const usernameInput = document.getElementById('username');
const registerBtn = document.getElementById('register-btn');

const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const uploadBtn = document.getElementById('upload-btn');
const imageInput = document.getElementById('image-input');

let messages = [];
let pollingInterval = null;

// Función para obtener mensajes
async function fetchMessages() {
  const response = await fetch(apiUrl, {
    headers: {
      'X-Master-Key': apiKey,
      'Accept': 'application/json'
    }
  });
  const data = await response.json();
  return data.record || [];
}

// Función para guardar mensajes
async function saveMessages() {
  await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'X-Master-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(messages)
  });
}

// Función para renderizar mensajes
function renderMessages() {
  messagesDiv.innerHTML = '';
  messages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    if (msg.sender === username) {
      msgDiv.classList.add('sent');
    } else {
      msgDiv.classList.add('received');
    }

    if (msg.type === 'text') {
      msgDiv.innerText = `${msg.sender}: ${msg.content}`;
    } else if (msg.type === 'image') {
      const img = document.createElement('img');
      img.src = msg.content;
      msgDiv.appendChild(img);
      const timeText = document.createElement('small');
      timeText.innerText = `Subido ${new Date(msg.timestamp).toLocaleString()}`;
      msgDiv.appendChild(timeText);
    }

    messagesDiv.appendChild(msgDiv);
  });
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Función para cargar nuevos mensajes
async function loadMessages() {
  const newMessages = await fetchMessages();
  if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
    messages = newMessages;
    renderMessages();
  }
}

// Registro del usuario
registerBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (name) {
    username = name;
    registerSection.style.display = 'none';
    chatSection.style.display = 'flex';
    // Cargar mensajes iniciales
    loadMessages();
    // Iniciar polling
    pollingInterval = setInterval(loadMessages, 3000);
  }
};

// Enviar mensaje de texto
sendBtn.onclick = async () => {
  const text = messageInput.value.trim();
  if (text) {
    messages.push({
      sender: username,
      content: text,
      type: 'text',
      timestamp: Date.now()
    });
    await saveMessages();
    messageInput.value = '';
    renderMessages();
  }
};

// Subir imagen
uploadBtn.onclick = () => {
  imageInput.click();
};

imageInput.onchange = async () => {
  const file = imageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async () => {
      // Aquí puedes subir la imagen a un servicio externo o usar Base64
      // Para simplificar, usaremos Base64
      const base64Image = reader.result;
      messages.push({
        sender: username,
        content: base64Image,
        type: 'image',
        timestamp: Date.now()
      });
      await saveMessages();
      renderMessages();
    };
    reader.readAsDataURL(file);
  }
};
