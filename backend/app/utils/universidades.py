"""
Base de datos de universidades en Puebla con sus coordenadas
Este archivo se puede mantener y actualizar fácilmente
"""

UNIVERSIDADES_PUEBLA = [
    # Universidades Públicas
    {
        "id": 1,
        "nombre": "BUAP",
        "nombre_completo": "Benemérita Universidad Autónoma de Puebla",
        "tipo": "publica",
        "campus": [
            {"nombre": "Ciudad Universitaria", "lat": 19.0022, "lng": -98.2066},
            {"nombre": "Campus Salud", "lat": 19.0387, "lng": -98.2036},
        ]
    },
    {
        "id": 2,
        "nombre": "ITP",
        "nombre_completo": "Instituto Tecnológico de Puebla",
        "tipo": "publica",
        "campus": [
            {"nombre": "Principal", "lat": 19.0433, "lng": -98.1983}
        ]
    },
    {
        "id": 3,
        "nombre": "UTM",
        "nombre_completo": "Universidad Tecnológica de Puebla",
        "tipo": "publica",
        "campus": [
            {"nombre": "Principal", "lat": 19.0828, "lng": -98.1997}
        ]
    },
    {
        "id": 4,
        "nombre": "UTP",
        "nombre_completo": "Universidad Tecnológica de Puebla",
        "tipo": "publica",
        "campus": [
            {"nombre": "Principal", "lat": 19.0828, "lng": -98.1997}
        ]
    },
    
    # Universidades Privadas
    {
        "id": 5,
        "nombre": "UDLAP",
        "nombre_completo": "Universidad de las Américas Puebla",
        "tipo": "privada",
        "campus": [
            {"nombre": "Principal", "lat": 19.0519, "lng": -98.2833}
        ]
    },
    {
        "id": 6,
        "nombre": "UPAEP",
        "nombre_completo": "Universidad Popular Autónoma del Estado de Puebla",
        "tipo": "privada",
        "campus": [
            {"nombre": "Campus Centro", "lat": 19.0414, "lng": -98.2063},
            {"nombre": "Campus Sur", "lat": 18.9969, "lng": -98.2472},
        ]
    },
    {
        "id": 7,
        "nombre": "IBERO Puebla",
        "nombre_completo": "Universidad Iberoamericana Puebla",
        "tipo": "privada",
        "campus": [
            {"nombre": "Principal", "lat": 19.0361, "lng": -98.2397}
        ]
    },
    {
        "id": 8,
        "nombre": "UMAD",
        "nombre_completo": "Universidad Madero",
        "tipo": "privada",
        "campus": [
            {"nombre": "Principal", "lat": 19.0433, "lng": -98.2067}
        ]
    },
    {
        "id": 9,
        "nombre": "UVM Puebla",
        "nombre_completo": "Universidad del Valle de México Campus Puebla",
        "tipo": "privada",
        "campus": [
            {"nombre": "Principal", "lat": 19.0361, "lng": -98.2486}
        ]
    },
    {
        "id": 10,
        "nombre": "UNITEC",
        "nombre_completo": "Universidad Tecnológica de México Campus Puebla",
        "tipo": "privada",
        "campus": [
            {"nombre": "Principal", "lat": 19.0447, "lng": -98.2344}
        ]
    },
    {
        "id": 11,
        "nombre": "UNIPUEBLA",
        "nombre_completo": "Universidad de Puebla",
        "tipo": "privada",
        "campus": [
            {"nombre": "Principal", "lat": 19.0392, "lng": -98.2089}
        ]
    },
    {
        "id": 12,
        "nombre": "UAP",
        "nombre_completo": "Universidad de las Américas Puebla",
        "tipo": "privada",
        "campus": [
            {"nombre": "Principal", "lat": 19.0519, "lng": -98.2833}
        ]
    },
    {
        "id": 13,
        "nombre": "UTEL",
        "nombre_completo": "Universidad Tecnológica Latinoamericana en Línea",
        "tipo": "privada",
        "campus": [
            {"nombre": "Principal", "lat": 19.0428, "lng": -98.2064}
        ]
    },
    {
        "id": 14,
        "nombre": "CESUP",
        "nombre_completo": "Centro de Estudios Superiores de Puebla",
        "tipo": "privada",
        "campus": [
            {"nombre": "Principal", "lat": 19.0347, "lng": -98.2106}
        ]
    },
    {
        "id": 15,
        "nombre": "ITSPP",
        "nombre_completo": "Instituto Tecnológico Superior de Puebla",
        "tipo": "privada",
        "campus": [
            {"nombre": "Principal", "lat": 19.0456, "lng": -98.1889}
        ]
    },
    {
        "id": 16,
        "nombre": "UIC",
        "nombre_completo": "Universidad Intercontinental Campus Puebla",
        "tipo": "privada",
        "campus": [
            {"nombre": "Principal", "lat": 19.0369, "lng": -98.2417}
        ]
    },
    {
        "id": 17,
        "nombre": "UNID",
        "nombre_completo": "Universidad Interamericana para el Desarrollo",
        "tipo": "privada",
        "campus": [
            {"nombre": "Principal", "lat": 19.0403, "lng": -98.2258}
        ]
    },
    {
        "id": 18,
        "nombre": "ANÁHUAC Puebla",
        "nombre_completo": "Universidad Anáhuac Puebla",
        "tipo": "privada",
        "campus": [
            {"nombre": "Principal", "lat": 19.0244, "lng": -98.2583}
        ]
    },
]


def get_todas_universidades():
    """Retorna lista de todas las universidades"""
    return UNIVERSIDADES_PUEBLA


def get_universidades_nombres():
    """Retorna solo los nombres para el dropdown"""
    nombres = []
    for uni in UNIVERSIDADES_PUEBLA:
        nombres.append({
            "value": uni["nombre"],
            "label": uni["nombre_completo"],
            "tipo": uni["tipo"]
        })
    return sorted(nombres, key=lambda x: x["label"])


def get_coordenadas_universidad(nombre: str):
    """
    Obtiene las coordenadas de una universidad por nombre
    Si tiene múltiples campus, retorna el principal (primer elemento)
    """
    for uni in UNIVERSIDADES_PUEBLA:
        if uni["nombre"].upper() == nombre.upper():
            # Retornar el primer campus (principal)
            campus_principal = uni["campus"][0]
            return {
                "nombre": uni["nombre"],
                "nombre_completo": uni["nombre_completo"],
                "lat": campus_principal["lat"],
                "lng": campus_principal["lng"],
                "campus": uni["campus"]
            }
    return None


def buscar_universidades(query: str):
    """
    Busca universidades por nombre (para autocomplete)
    """
    query_lower = query.lower()
    resultados = []
    
    for uni in UNIVERSIDADES_PUEBLA:
        if (query_lower in uni["nombre"].lower() or 
            query_lower in uni["nombre_completo"].lower()):
            resultados.append({
                "value": uni["nombre"],
                "label": uni["nombre_completo"],
                "tipo": uni["tipo"]
            })
    
    return resultados


# Para agregar fácilmente nuevas universidades, solo necesitas:
# 1. Buscar las coordenadas en Google Maps (clic derecho -> "¿Qué hay aquí?")
# 2. Agregar un nuevo diccionario a UNIVERSIDADES_PUEBLA con el formato:
"""
{
    "id": XX,
    "nombre": "SIGLAS",
    "nombre_completo": "Nombre Completo de la Universidad",
    "tipo": "publica" o "privada",
    "campus": [
        {"nombre": "Nombre del Campus", "lat": XX.XXXX, "lng": -XX.XXXX}
    ]
}
"""