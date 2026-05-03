from app.db import get_connection, fix_row


def crear_envio(usuario_id, destinatario_id, numero_tracking, peso, descripcion, fecha_estimada):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO envios (usuario_id, destinatario_id, numero_tracking, peso, descripcion, fecha_estimada)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (usuario_id, destinatario_id, numero_tracking, peso, descripcion, fecha_estimada),
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        conn.close()


def buscar_por_id(envio_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM envios WHERE id = %s", (envio_id,))
        return fix_row(cursor.fetchone())
    finally:
        cursor.close()
        conn.close()


def buscar_por_tracking(numero_tracking):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM envios WHERE numero_tracking = %s", (numero_tracking,))
        return fix_row(cursor.fetchone())
    finally:
        cursor.close()
        conn.close()


def listar_por_usuario(usuario_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT e.*, d.nombre as dest_nombre, d.apellido as dest_apellido,
                      d.direccion as dest_direccion, d.localidad as dest_localidad,
                      d.codigo_postal as dest_cp, d.telefono as dest_telefono
               FROM envios e
               JOIN destinatarios d ON e.destinatario_id = d.id
               WHERE e.usuario_id = %s
               ORDER BY e.fecha_creacion DESC""",
            (usuario_id,),
        )
        return [fix_row(r) for r in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()


def listar_todos(estado=None, query=None):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """SELECT e.*, d.nombre as dest_nombre, d.apellido as dest_apellido,
                        d.direccion as dest_direccion, d.localidad as dest_localidad,
                        d.codigo_postal as dest_cp, d.telefono as dest_telefono,
                        u.nombre as rem_nombre, u.apellido as rem_apellido, u.email as rem_email
                 FROM envios e
                 JOIN destinatarios d ON e.destinatario_id = d.id
                 JOIN usuarios u ON e.usuario_id = u.id"""
        conditions, params = [], []
        if estado:
            conditions.append(
                "e.id IN (SELECT envio_id FROM estado_envio ee WHERE ee.id = "
                "(SELECT MAX(id) FROM estado_envio WHERE envio_id = ee.envio_id) AND ee.estado = %s)"
            )
            params.append(estado)
        if query:
            conditions.append("e.numero_tracking LIKE %s")
            params.append(f"%{query}%")
        if conditions:
            sql += " WHERE " + " AND ".join(conditions)
        sql += " ORDER BY e.fecha_creacion DESC"
        cursor.execute(sql, params)
        return [fix_row(r) for r in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()


def existe_tracking(numero_tracking):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT 1 FROM envios WHERE numero_tracking = %s LIMIT 1",
            (numero_tracking,),
        )
        return cursor.fetchone() is not None
    finally:
        cursor.close()
        conn.close()


def stats_por_usuario(usuario_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT
                 (SELECT COUNT(*) FROM envios WHERE usuario_id = %s) as total,
                 (SELECT COUNT(*) FROM estado_envio ee
                  JOIN (SELECT envio_id, MAX(id) as max_id FROM estado_envio GROUP BY envio_id) latest
                  ON ee.id = latest.max_id
                  JOIN envios e ON e.id = ee.envio_id
                  WHERE e.usuario_id = %s AND ee.estado IN ('EN_TRANSITO','EN_DISTRIBUCION')) as en_transito,
                 (SELECT COUNT(*) FROM estado_envio ee
                  JOIN (SELECT envio_id, MAX(id) as max_id FROM estado_envio GROUP BY envio_id) latest
                  ON ee.id = latest.max_id
                  JOIN envios e ON e.id = ee.envio_id
                  WHERE e.usuario_id = %s AND ee.estado = 'ENTREGADO') as entregados""",
            (usuario_id, usuario_id, usuario_id),
        )
        return fix_row(cursor.fetchone())
    finally:
        cursor.close()
        conn.close()


def stats_globales():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT
                 (SELECT COUNT(*) FROM envios) as total,
                 (SELECT COUNT(*) FROM estado_envio ee
                  JOIN (SELECT envio_id, MAX(id) as max_id FROM estado_envio GROUP BY envio_id) latest
                  ON ee.id = latest.max_id
                  WHERE ee.estado IN ('EN_TRANSITO','EN_DISTRIBUCION')) as en_transito,
                 (SELECT COUNT(*) FROM estado_envio ee
                  JOIN (SELECT envio_id, MAX(id) as max_id FROM estado_envio GROUP BY envio_id) latest
                  ON ee.id = latest.max_id
                  WHERE ee.estado = 'ENTREGADO') as entregados,
                 (SELECT COUNT(*) FROM estado_envio ee
                  JOIN (SELECT envio_id, MAX(id) as max_id FROM estado_envio GROUP BY envio_id) latest
                  ON ee.id = latest.max_id
                  WHERE ee.estado IN ('PENDIENTE','PROCESANDO')) as pendientes,
                 (SELECT COUNT(*) FROM estado_envio ee
                  JOIN (SELECT envio_id, MAX(id) as max_id FROM estado_envio GROUP BY envio_id) latest
                  ON ee.id = latest.max_id
                  WHERE ee.estado = 'CANCELADO') as cancelados"""
        )
        return fix_row(cursor.fetchone())
    finally:
        cursor.close()
        conn.close()
