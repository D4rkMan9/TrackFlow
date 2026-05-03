from app.db import get_connection, fix_row


def crear_estado(envio_id, estado, descripcion=None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO estado_envio (envio_id, estado, descripcion)
               VALUES (%s, %s, %s)""",
            (envio_id, estado, descripcion),
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def historial_por_envio(envio_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT estado, descripcion, fecha_hora
               FROM estado_envio
               WHERE envio_id = %s
               ORDER BY fecha_hora ASC""",
            (envio_id,),
        )
        return [fix_row(r) for r in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()


def estado_actual(envio_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT estado, descripcion, fecha_hora
               FROM estado_envio
               WHERE envio_id = %s
               ORDER BY fecha_hora DESC
               LIMIT 1""",
            (envio_id,),
        )
        return fix_row(cursor.fetchone())
    finally:
        cursor.close()
        conn.close()
