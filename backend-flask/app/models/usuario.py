from app.db import get_connection, fix_row


def crear_usuario(nombre, apellido, email, telefono, password_hash):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash)
               VALUES (%s, %s, %s, %s, %s)""",
            (nombre, apellido, email, telefono, password_hash),
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        conn.close()


def buscar_por_email(email):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
        return fix_row(cursor.fetchone())
    finally:
        cursor.close()
        conn.close()


def buscar_por_id(user_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, nombre, apellido, email, telefono, fecha_registro FROM usuarios WHERE id = %s",
            (user_id,),
        )
        return fix_row(cursor.fetchone())
    finally:
        cursor.close()
        conn.close()


def actualizar_perfil(user_id, nombre=None, apellido=None, telefono=None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        campos, valores = [], []
        if nombre is not None:
            campos.append("nombre = %s")
            valores.append(nombre)
        if apellido is not None:
            campos.append("apellido = %s")
            valores.append(apellido)
        if telefono is not None:
            campos.append("telefono = %s")
            valores.append(telefono)
        if not campos:
            return
        valores.append(user_id)
        cursor.execute(
            f"UPDATE usuarios SET {', '.join(campos)} WHERE id = %s",
            valores,
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def cambiar_password(user_id, nuevo_hash):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE usuarios SET password_hash = %s WHERE id = %s",
            (nuevo_hash, user_id),
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()
