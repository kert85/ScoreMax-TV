// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBcDmSu6QtsXa_9lmkPF0LLGzFtbO2Ovqw",
  authDomain: "scoremax-tv.firebaseapp.com",
  projectId: "scoremax-tv",
  storageBucket: "scoremax-tv.appspot.com",
  messagingSenderId: "395524778611",
  appId: "1:395524778611:web:97d31c4532e8bc53bbd806",
  measurementId: "G-GP8Z3HPHQG"
};

// Inicializar
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Alternar login/registro
window.toggleForms = () => {
  document.getElementById("loginDiv").style.display =
    document.getElementById("loginDiv").style.display === "none" ? "block" : "none";
  document.getElementById("registerDiv").style.display =
    document.getElementById("registerDiv").style.display === "none" ? "block" : "none";
  document.getElementById("errorBox").innerText = "";
};

// Registro
const registerBtn = document.getElementById("registerBtn");
if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const pass = document.getElementById("registerPassword").value;
    const errorBox = document.getElementById("errorBox");

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCred.user, { displayName: name });

      // Guardar rol por defecto
      await setDoc(doc(db, "usuarios", userCred.user.uid), {
        nombre: name,
        email: email,
        rol: "usuario"
      });

      errorBox.innerText = "✅ Registro exitoso, ahora inicia sesión.";
      toggleForms();
    } catch (err) {
      errorBox.innerText = "Error: " + err.message;
    }
  });
}

// Login
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value;
    const pass = document.getElementById("loginPassword").value;
    const errorBox = document.getElementById("errorBox");

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, pass);
      const uid = userCred.user.uid;

      const userDoc = await getDoc(doc(db, "usuarios", uid));
      if (userDoc.exists()) {
        const rol = userDoc.data().rol;
        if (rol === "admin" || rol === "moderador" || rol === "propietario") {
          window.location.href = "panel_admin.html";
        } else {
          window.location.href = "panel_usuario.html";
        }
      } else {
        errorBox.innerText = "No se encontró el rol del usuario.";
      }
    } catch (err) {
      errorBox.innerText = "Error: " + err.message;
    }
  });
}

// Agregar película (solo admin)
const agregarBtn = document.getElementById("agregarBtn");
if (agregarBtn) {
  agregarBtn.addEventListener("click", async () => {
    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;
    const link = document.getElementById("link").value;

    if (titulo && descripcion && link) {
      await addDoc(collection(db, "peliculas"), {
        titulo,
        descripcion,
        link
      });
      alert("✅ Película agregada");
      location.reload();
    }
  });
}

// Mostrar películas (usuario/admin)
async function mostrarPeliculas() {
  const contenedor = document.getElementById("peliculas");
  if (contenedor) {
    contenedor.innerHTML = "";
    const querySnap = await getDocs(collection(db, "peliculas"));
    querySnap.forEach(docSnap => {
      const p = docSnap.data();
      contenedor.innerHTML += `
        <div class="pelicula">
          <h3>${p.titulo}</h3>
          <p>${p.descripcion}</p>
          <a href="${p.link}" target="_blank">Ver película</a>
        </div>
      `;
    });
  }
}
mostrarPeliculas();

// Logout
window.logout = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};