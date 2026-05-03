from app.db import get_connection, fix_row


def crear_destinatario(nombre, apellido, direccion, localidad, codigo_postal, telefono):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO destinatarios (nombre, apellido, direccion, localidad, codigo_postal, telefono)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (nombre, apellido, direccion, localidad, codigo_postal, telefono),
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        conn.close()


def buscar_por_id(destinatario_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM destinatarios WHERE id = %s", (destinatario_id,))
        return fix_row(cursor.fetchone())
    finally:
        cursor.close()
        conn.close()
