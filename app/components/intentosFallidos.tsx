/*'use client'

import { useState } from 'react';
import { auth, database } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get, set, update } from 'firebase/database';
import Turnstile from 'react-turnstile'; // Turnstile npm package

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarCaptcha, setMostrarCaptcha] = useState(false);
  const [captchaValido, setCaptchaValido] = useState(false);
  const [retardo, setRetardo] = useState(0);
  const [error, setError] = useState('');

  const verificarEstadoUsuario = async (uid: string) => {
    const userRef = ref(database, `usuarios/${uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return data;
    }
    return null;
  };

  const actualizarEstadoUsuario = async (uid: string, data: object) => {
    const userRef = ref(database, `usuarios/${uid}`);
    await update(userRef, data);
  };

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Resetear intentos si el login fue exitoso
      const uid = userCredential.user.uid;
      await actualizarEstadoUsuario(uid, { intentosFallidos: 0, bloqueoHasta: null });
      
      // Redirigir o continuar
    } catch (error) {
      console.error(error);
      setError('Error en login');

      // Manejar intentos fallidos
      const uid = email.replace('.', '_'); // Usa otro sistema real para mapear UID en producción
      const userStatus = await verificarEstadoUsuario(uid);

      const ahora = Date.now();
      let intentos = (userStatus?.intentosFallidos ?? 0) + 1;
      let bloqueoHasta = userStatus?.bloqueoHasta ?? null;

      // Si está bloqueado
      if (bloqueoHasta && ahora < bloqueoHasta) {
        setError('Cuenta bloqueada. Intenta más tarde.');
        return;
      }

      // Lógica según número de intentos
      if (intentos >= 10) {
        bloqueoHasta = ahora + 30 * 60 * 1000; // 30 min
        setError('Cuenta bloqueada por 30 minutos');
      } else if (intentos >= 7) {
        setMostrarCaptcha(true);
        setCaptchaValido(false);
        if (intentos === 7) setRetardo(1 * 60 * 1000); // 1 min
        if (intentos === 8) setRetardo(5 * 60 * 1000); // 5 min
        if (intentos === 9) setRetardo(15 * 60 * 1000); // 15 min
        setError(`Debes resolver CAPTCHA y esperar`);
      } else if (intentos >= 4) {
        setMostrarCaptcha(true);
        setCaptchaValido(false);
        setError('Debes resolver CAPTCHA para continuar.');
      }

      await actualizarEstadoUsuario(uid, {
        intentosFallidos: intentos,
        ultimoIntento: ahora,
        bloqueoHasta: bloqueoHasta ?? null,
      });

      if (retardo > 0) {
        await new Promise(res => setTimeout(res, retardo)); // Retardo progresivo
      }
    }
  };

  return (
    <form onSubmit={manejarLogin}>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {mostrarCaptcha && (
        <Turnstile
          sitekey="TU_SITE_KEY_DE_TURNSTILE"
          onSuccess={() => setCaptchaValido(true)}
          onError={() => setCaptchaValido(false)}
        />
      )}

      <button type="submit" disabled={mostrarCaptcha && !captchaValido}>
        Iniciar sesión
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
*/