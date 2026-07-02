# **EpiBooks — Diario di lavoro e note personali**
# 02/07/2026
## Come ho usato Bootstrap
Ho installato due pacchetti:

- bootstrap → il CSS con tutte le classi di utilità
- react-bootstrap → i componenti React già pronti (Card, Row, Col, ecc.)

Questo va **prima** del mio index.css, così le mie regole possono sovrascrivere quelle di Bootstrap quando serve, senza dover usare !important ovunque.
## La griglia di libri — come funziona Row e Col
Per mettere i libri in griglia ho usato il sistema a 12 colonne di Bootstrap. La logica è:

> <Row className="g-3">\
`  `<Col xs={12} md={4}>\
`    `<BookCard ... />\
`  `</Col>\
</Row>

- xs={12} → su schermi piccoli (mobile), ogni card occupa tutte e 12 le colonne = una card per riga
- md={4} → da tablet in su, ogni card occupa 4 colonne su 12, quindi 12÷4 = **3 card per riga**
- g-3 → un po' di spazio tra le card (gap)

Ho inoltre messo una width fissa sulla card (tipo width: 12rem) e la metto dentro una colonna che è più larga, la card "galleggia" e lo spazio vuoto intorno sembra un gap ma non lo è — è solo la colonna più larga della card. La soluzione è usare width: 100% sulla card, così riempie sempre la sua colonna.

Bootstrap di default lascia che ogni card sia alta quanto il suo contenuto e quindi carte con titoli lunghi vengono più alte. Per renderle tutte uguali ho scritto queste regole in App.css:

/\* larghezza: riempie la colonna \*/\
.book-card {\
`  `display: flex;\
`  `flex-direction: column;\
`  `height: 100%;\
}\
\
/\* tutte le copertine alte uguale, ritagliate senza deformarsi \*/\
.book-card .card-img-top {\
`  `height: 280px;\
`  `object-fit: cover;\
}\
\
/\* titolo troncato a 2 righe, con i ... se è troppo lungo \*/\
.book-card .card-title {\
`  `font-size: 0.9rem;\
`  `display: -webkit-box;\
`  `-webkit-line-clamp: 2;\
`  `-webkit-box-orient: vertical;\
`  `overflow: hidden;\
`  `min-height: 2.4em; /\* riserva sempre spazio per 2 righe \*/\
}

Il -webkit-line-clamp è una proprietà che tronca il testo dopo N righe aggiungendo i .... Ha il prefisso -webkit- perché nasce come proprietà proprietaria di Chrome/Safari, ma ormai funziona su tutti i browser moderni. Per funzionare ha bisogno di essere usata insieme alle altre tre righe (display: -webkit-box, -webkit-box-orient, overflow: hidden) perchè non basta da sola.

-----
## Come ho gestito lo stile inline e il CSS
**2. Style inline** (necessario quando il valore dipende da JavaScript):

<Card style={{ border: props.selected ? "3px solid gold" : "none" }}>

In questo caso non posso mettere il bordo nel CSS perché dipende da props.selected, che è una variabile React e dunque il CSS non conosce le variabili di React. Lo style inline è l'unica opzione per questi casi. Lo riconosco subito perché ha **due paia di parentesi graffe**: quella esterna è JSX (per "entrare" in JavaScript), quella interna è l'oggetto JavaScript con le proprietà CSS (in camelCase: borderColor invece di border-color).

-----
## Come funziona useState
useState è l'hook di React per gestire lo stato di un componente: cioè valori che quando cambiano fanno aggiornare la pagina automaticamente.

const [searchQuery, setSearchQuery] = useState("");

Qui sto dicendo: "voglio uno stato che si chiama searchQuery, parte vuoto, e quando lo devo cambiare uso setSearchQuery". Non posso cambiare searchQuery direttamente (tipo searchQuery = "witcher") perché React non se ne accorgerebbe e non aggiornerebbe la pagina.

Ho usato useState per tre cose:

- searchQuery  quello che sto scrivendo nella barra di ricerca
- selectedAsin l'asin del libro selezionato (o null se nessuno è selezionato)
- comments, loading, error → lo stato delle recensioni dentro CommentArea
-----
## Il filtro di ricerca — filter + map
Nella barra di ricerca ho combinato due metodi array in sequenza:

const filteredBooks = books.filter((book) =>\
`  `book.title.toLowerCase().includes(searchQuery.toLowerCase())\
);

Prima .filter() scorre tutti i libri e tiene solo quelli il cui titolo contiene quello che ho scritto. Poi .map() trasforma quei libri in card JSX. I due metodi vengono usati insieme perché:

- .filter() decide **quali** elementi tenere
- .map() decide **come** visualizzare ogni elemento

Il .toLowerCase() su entrambi i valori serve per rendere la ricerca non case-sensitive: "witcher" trova "The Witcher" anche se non ho scritto la maiuscola.

-----
## Lifting state up
All'inizio ogni card gestiva da sola il proprio stato "sono selezionata o no":

// PRIMA (sbagliato per questo caso)\
const [selected, setSelected] = useState(false);

Il problema: se ogni card sa solo di sé stessa, ListBooks non sa mai quale libro è selezionato, e non può passare quella informazione a CommentArea per fare la chiamata API.

La soluzione si chiama **lifting state up** (sollevare lo stato): sposto lo stato a un livello superiore, in ListBooks, e lo passo giù alle card come prop.

// IN ListBooks.jsx\
const [selectedAsin, setSelectedAsin] = useState(null);\
\
// passo giù alle card\
<BookCard\
`  `selected={book.asin === selectedAsin}  // true solo per la card selezionata\
`  `onSelect={handleSelect}                 // la funzione per selezionarla\
/>\
\
// IN card.jsx\
<Card onClick={() => props.onSelect(props.asin)}>

Così ListBooks è l'unico che sa quale libro è selezionato, e può passare quella informazione sia alle card (per mostrare il bordo dorato) che a CommentArea (per fare la GET delle recensioni).

-----
## Le chiamate API
In questo progetto ho due tipi di dati:

**Dati locali** (il file fantasy.json)

import books from "../data/fantasy.json";\
// books è già un array, posso usarlo subito

**Dati remoti** (le recensioni): devono essere richiesti a un server esterno tramite una chiamata HTTP. Qui entra in gioco fetch.

-----
## Come funziona fetch
fetch è una funzione JavaScript built-in per fare richieste HTTP. Restituisce una **Promise** — cioè non dà il risultato subito, ma "promette" di darlo quando il server risponde.

La versione con async/await (quella che ho usato) è la più leggibile:

const fetchComments = async () => {\
`  `const response = await fetch("https://url-del-server/api/comments/" + asin, {\
`    `headers: {\
`      `Authorization: `Bearer ${TOKEN}`,\
`    `},\
`  `});\
\
`  `const data = await response.json();\
`  `setComments(data);\
};

async davanti alla funzione dice "questa funzione è asincrona, può aspettare cose". await davanti a fetch dice "aspetta qui finché il server risponde, poi continua". Senza await, il codice andrebbe avanti prima che la risposta arrivi, e data sarebbe vuoto.

Il response.json() converte la risposta (che arriva come testo) in un oggetto JavaScript che posso usare. Anche questo è asincrono, quindi ci vuole await.

-----
## Come funziona useEffect
useEffect è l'hook di React per fare cose "di lato" — cioè operazioni che non producono direttamente HTML, come chiamate API, timer, o ascolto di eventi.

useEffect(() => {\
`  `fetchComments();\
}, [asin]);

Il secondo argomento [asin] si chiama **array delle dipendenze** e dice a React: "esegui questa funzione ogni volta che asin cambia". Se mettessi [] vuoto, girerebbe solo al primo render. Se non mettessi niente, girerebbe ad ogni render (il che è quasi sempre sbagliato).

Nel mio caso: ogni volta che seleziono un libro diverso, asin cambia, useEffect si accorge del cambiamento, e parte una nuova chiamata GET per caricare le recensioni di quel libro.

Un limite importante: useEffect non può essere async direttamente. Per questo ho dovuto creare una funzione async separata (fetchComments) e chiamarla dentro useEffect.

-----
## GET, POST, DELETE
**GET** (leggere le recensioni):

const response = await fetch(\
`  `"https://striveschool-api.herokuapp.com/api/comments/" + asin,\
`  `{\
`    `headers: { Authorization: `Bearer ${TOKEN}`}\
`  `}\
);

Non serve specificare il metodo perché GET è il default di fetch. Passo solo l'asin nell'URL.

**POST** (scrivere una nuova recensione):

const response = await fetch(\
`  `"https://striveschool-api.herokuapp.com/api/comments/",\
`  `{\
`    `method: "POST",\
`    `headers: {\
`      `Authorization: `Bearer ${TOKEN}`,\
`      `"Content-Type": "application/json",\
`    `},\
`    `body: JSON.stringify({\
`      `comment: comment,\
`      `rate: rate,\
`      `elementId: asin,\
`    `}),\
`  `}\
);

Qui devo specificare method: "POST", il Content-Type per dire al server che sto mandando JSON, e il body con i dati della recensione. JSON.stringify() converte l'oggetto JavaScript in una stringa JSON che il server può leggere.

**DELETE** (eliminare una recensione — extra):

const response = await fetch(\
`  `"https://striveschool-api.herokuapp.com/api/comments/" + commentId,\
`  `{\
`    `method: "DELETE",\
`    `headers: { Authorization: "Bearer " + TOKEN }\
`  `}\
);

Passo l'id della singola recensione (non l'asin del libro) nell'URL.

-----
## Event bubbling — quando il click "sale" troppo in alto
## Ho incontrato un bug strano: quando cliccavo il campo numerico del voto dentro il form di recensione, la finestra delle recensioni si chiudeva. Il motivo è l'event bubbling: in JavaScript, quando clicchi un elemento, il click non si ferma lì ma "sale" attraverso tutti i genitori nel DOM, uno per uno, finché non arriva in cima. Nel mio caso il click sul campo numerico saliva fino alla Card di Bootstrap, che aveva un onClick per selezionare/deselezionare il libro. Questo toglieva la selezione e faceva sparire CommentArea. La soluzione è e.stopPropagation() che ferma il click esattamente dove vuoi tu, impedendogli di salire ulteriormente: jsx{props.selected && ( 
e.stopPropagation()}>  )} Ho messo stopPropagation sul div che avvolge CommentArea in card.jsx così tutti i click che avvengono dentro la sezione recensioni vengono fermati lì, senza toccare nessun altro file.
## Come ho gestito loading ed errori
Ogni chiamata API può andare storta (rete assente, token scaduto, server down). Per questo ho sempre tre stati insieme:

const [comments, setComments] = useState([]);\
const [loading, setLoading] = useState(false);\
const [error, setError] = useState(null);

E nel JSX mostro cose diverse in base allo stato:

{loading && <Spinner animation="border" />}\
{error && <Alert variant="danger">{error}</Alert>}\
{!loading && !error && comments.length === 0 && <p>Nessuna recensione.</p>}\
{comments.map(...)}

Ho usato anche try/catch/finally:

- try → provo a fare la chiamata
- catch → se va storto, salvo il messaggio di errore
- finally → si esegue sempre, sia in caso di successo che di errore — perfetto per toglie lo spinner
-----
## Struttura delle dipendenze dei componenti
App.jsx\
├── NavBar          (statico)\
├── Hero            (statico)\
├── ListBooks       (gestisce searchQuery e selectedAsin)\
│   ├── BookCard × N    (riceve selected e onSelect come props)\
│   │   └── CommentArea (se selected = true)\
│   │       └── AddComment\
└── Footer          (statico)
