// Datos del backend simulado. En un proyecto real vivirían en la base de datos del servidor;
// aquí solo los usan los mocks (handlers REST y GraphQL), nunca los componentes directamente.

// Destinos: se entregan por REST (país y actividades populares)
export const destinos = [
  {
    id: "cusco",
    nombre: "Cusco",
    pais: "Perú",
    descripcion: "Antigua capital inca a más de 3.400 metros, puerta de entrada a Machu Picchu.",
    actividades: ["Valle Sagrado", "Machu Picchu", "Gastronomía andina"],
  },
  {
    id: "bariloche",
    nombre: "San Carlos de Bariloche",
    pais: "Argentina",
    descripcion: "Lagos, bosques y cerros patagónicos con chocolaterías y senderos todo el año.",
    actividades: ["Circuito Chico", "Cerro Catedral", "Degustación de chocolate"],
  },
  {
    id: "puerto-natales",
    nombre: "Puerto Natales",
    pais: "Chile",
    descripcion: "Base para explorar el Parque Nacional Torres del Paine y los fiordos magallánicos.",
    actividades: ["Torres del Paine", "Navegación por fiordos", "Glaciar Grey"],
  },
  {
    id: "rio-de-janeiro",
    nombre: "Río de Janeiro",
    pais: "Brasil",
    descripcion: "Playas urbanas, samba y el Cristo Redentor sobre el cerro Corcovado.",
    actividades: ["Cristo Redentor", "Playa de Copacabana", "Samba en Lapa"],
  },
  {
    id: "kioto",
    nombre: "Kioto",
    pais: "Japón",
    descripcion: "Templos, jardines y barrios tradicionales de la antigua capital imperial.",
    actividades: ["Kinkaku-ji", "Bosque de bambú de Arashiyama", "Ceremonia del té"],
  },
  {
    id: "lisboa",
    nombre: "Lisboa",
    pais: "Portugal",
    descripcion: "Colinas, tranvías históricos y fado en las calles de Alfama.",
    actividades: ["Tranvía 28", "Fado en Alfama", "Torre de Belém"],
  },
];

// Vuelos por destino: GraphQL los consulta junto con los hoteles.
// asientosDisponibles = 0 significa que el vuelo está completo.
export const vuelos = [
  { id: "v-cus-1", destinoId: "cusco", aerolinea: "Aerolínea Andina", origen: "Santiago (SCL)", salida: "2027-01-15T08:30:00", llegada: "2027-01-15T13:10:00", precio: 289990, moneda: "CLP", asientosDisponibles: 12 },
  { id: "v-cus-2", destinoId: "cusco", aerolinea: "Cóndor Sur", origen: "Santiago (SCL)", salida: "2027-01-18T22:15:00", llegada: "2027-01-19T04:40:00", precio: 241990, moneda: "CLP", asientosDisponibles: 0 },
  { id: "v-bar-1", destinoId: "bariloche", aerolinea: "Pacífico Air", origen: "Santiago (SCL)", salida: "2027-02-03T07:00:00", llegada: "2027-02-03T10:20:00", precio: 198990, moneda: "CLP", asientosDisponibles: 4 },
  { id: "v-bar-2", destinoId: "bariloche", aerolinea: "Aerolínea Andina", origen: "Santiago (SCL)", salida: "2027-02-06T16:45:00", llegada: "2027-02-06T19:55:00", precio: 214990, moneda: "CLP", asientosDisponibles: 9 },
  { id: "v-pnt-1", destinoId: "puerto-natales", aerolinea: "Cóndor Sur", origen: "Santiago (SCL)", salida: "2027-03-10T06:10:00", llegada: "2027-03-10T09:25:00", precio: 176990, moneda: "CLP", asientosDisponibles: 20 },
  { id: "v-pnt-2", destinoId: "puerto-natales", aerolinea: "Pacífico Air", origen: "Santiago (SCL)", salida: "2027-03-14T18:00:00", llegada: "2027-03-14T21:05:00", precio: 165990, moneda: "CLP", asientosDisponibles: 2 },
  { id: "v-rio-1", destinoId: "rio-de-janeiro", aerolinea: "Aerolínea Andina", origen: "Santiago (SCL)", salida: "2027-04-02T09:00:00", llegada: "2027-04-02T14:30:00", precio: 325990, moneda: "CLP", asientosDisponibles: 7 },
  { id: "v-rio-2", destinoId: "rio-de-janeiro", aerolinea: "Cóndor Sur", origen: "Santiago (SCL)", salida: "2027-04-06T23:30:00", llegada: "2027-04-07T06:45:00", precio: 298990, moneda: "CLP", asientosDisponibles: 0 },
  { id: "v-kio-1", destinoId: "kioto", aerolinea: "Pacífico Air", origen: "Santiago (SCL)", salida: "2027-05-20T11:50:00", llegada: "2027-05-21T16:20:00", precio: 1189990, moneda: "CLP", asientosDisponibles: 5 },
  { id: "v-kio-2", destinoId: "kioto", aerolinea: "Aerolínea Andina", origen: "Santiago (SCL)", salida: "2027-05-25T13:15:00", llegada: "2027-05-26T18:40:00", precio: 1095990, moneda: "CLP", asientosDisponibles: 3 },
  { id: "v-lis-1", destinoId: "lisboa", aerolinea: "Cóndor Sur", origen: "Santiago (SCL)", salida: "2027-06-08T20:00:00", llegada: "2027-06-09T14:10:00", precio: 689990, moneda: "CLP", asientosDisponibles: 11 },
  { id: "v-lis-2", destinoId: "lisboa", aerolinea: "Pacífico Air", origen: "Santiago (SCL)", salida: "2027-06-12T10:25:00", llegada: "2027-06-13T04:55:00", precio: 642990, moneda: "CLP", asientosDisponibles: 0 },
];

// Hoteles por destino. habitacionesDisponibles = 0 significa que no hay cupo en esas fechas.
export const hoteles = [
  { id: "h-cus-1", destinoId: "cusco", nombre: "Hotel Plaza Imperial", estrellas: 4, precioNoche: 129990, moneda: "CLP", checkIn: "2027-01-15", checkOut: "2027-01-19", habitacionesDisponibles: 6 },
  { id: "h-cus-2", destinoId: "cusco", nombre: "Casa Andina Boutique", estrellas: 3, precioNoche: 74990, moneda: "CLP", checkIn: "2027-01-15", checkOut: "2027-01-19", habitacionesDisponibles: 0 },
  { id: "h-bar-1", destinoId: "bariloche", nombre: "Lodge del Lago", estrellas: 5, precioNoche: 210990, moneda: "CLP", checkIn: "2027-02-03", checkOut: "2027-02-08", habitacionesDisponibles: 2 },
  { id: "h-bar-2", destinoId: "bariloche", nombre: "Cabañas del Bosque", estrellas: 3, precioNoche: 89990, moneda: "CLP", checkIn: "2027-02-03", checkOut: "2027-02-08", habitacionesDisponibles: 8 },
  { id: "h-pnt-1", destinoId: "puerto-natales", nombre: "Hostería Patagonia Sur", estrellas: 4, precioNoche: 145990, moneda: "CLP", checkIn: "2027-03-10", checkOut: "2027-03-14", habitacionesDisponibles: 4 },
  { id: "h-pnt-2", destinoId: "puerto-natales", nombre: "Hostal Fiordo Azul", estrellas: 2, precioNoche: 49990, moneda: "CLP", checkIn: "2027-03-10", checkOut: "2027-03-14", habitacionesDisponibles: 10 },
  { id: "h-rio-1", destinoId: "rio-de-janeiro", nombre: "Hotel Copacabana Mar", estrellas: 4, precioNoche: 168990, moneda: "CLP", checkIn: "2027-04-02", checkOut: "2027-04-06", habitacionesDisponibles: 3 },
  { id: "h-rio-2", destinoId: "rio-de-janeiro", nombre: "Pousada Santa Teresa", estrellas: 3, precioNoche: 82990, moneda: "CLP", checkIn: "2027-04-02", checkOut: "2027-04-06", habitacionesDisponibles: 5 },
  { id: "h-kio-1", destinoId: "kioto", nombre: "Ryokan Gion Tradicional", estrellas: 4, precioNoche: 265990, moneda: "CLP", checkIn: "2027-05-21", checkOut: "2027-05-25", habitacionesDisponibles: 1 },
  { id: "h-kio-2", destinoId: "kioto", nombre: "Hotel Shijo Central", estrellas: 3, precioNoche: 118990, moneda: "CLP", checkIn: "2027-05-21", checkOut: "2027-05-25", habitacionesDisponibles: 6 },
  { id: "h-lis-1", destinoId: "lisboa", nombre: "Hotel Alfama Miradouro", estrellas: 4, precioNoche: 157990, moneda: "CLP", checkIn: "2027-06-09", checkOut: "2027-06-13", habitacionesDisponibles: 0 },
  { id: "h-lis-2", destinoId: "lisboa", nombre: "Residencial Baixa Sol", estrellas: 2, precioNoche: 67990, moneda: "CLP", checkIn: "2027-06-09", checkOut: "2027-06-13", habitacionesDisponibles: 9 },
];
