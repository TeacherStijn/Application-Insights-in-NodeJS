let appInsights = require('applicationinsights');
// volgende stap kan veiliger:
let appConn = appInsights.setup('InstrumentationKey=63143a8b-7224-40ce-8f15-a9dcf48df64c;IngestionEndpoint=https://westeurope-5.in.applicationinsights.azure.com/;LiveEndpoint=https://westeurope.livediagnostics.monitor.azure.com/');
appConn.start();
const APP = require('express')();
const PORT = 1234;
let start = Date.now();

APP.listen(
    PORT,
    () => { 
		console.log(`hij doet het op port ${PORT}`);
	
		// Custom metric:
		let duur = Date.now() - start;
		appInsights.defaultClient.trackMetric({name: "Startup time", value: duur});
	}
);

// Middleware basis HTTP basic auth 'security' check ;)
// Voortaan dus een req, een res én een next functie input
// expres even uitgeschreven functie
function authenticatie (req,res,next) {

    console.log('Gebruikte headers: ', req.headers);
    if (req.headers.authorization) {

        const auth = {
            username: 'test', password: 'testpassword'
        }

        // HTTP basic auth gebruikt Base64, kán leeg zijn:
        const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
        const [username, password] = Buffer.from(b64auth, 'base64').toString().split(':');

        if (username === auth.username && password === auth.password) {
            // meegegeven functie v/h op toegepaste request (get/post/etc) draaien
            return next();
        }

        res.setHeader('WWW-Authenticate', 'Basic');
        res.status(401).send('Geen geldige authenticatie');
    }

    res.setHeader('WWW-Authenticate', 'Basic');
    res.status(401).send('Geen geldige authenticatie');
}

APP.use(authenticatie);

const DATA = [
    {
        merk: 'BMW',
        type: '2002 Turbo'
    },
    {
        merk: 'Audi',
        type: 'Quattro Sport'
    },
    {
        merk: 'Nissan',
        type: 'Skyline GTR'
    }
];

APP.get(
	'/',
	(req,res) => {
		res.status(200).send(`<!DOCTYPE html>
				<html>
					<head>
						<title>Data API voorbeeld</title>
					</head>
					<body>
						Mogelijke URL's:
						<ul>
							<li>/autos/<merk></li>
						</ul>
						
						Mogelijke merken:
						${DATA.map(e=>e.merk).join(',')}
					</body>				
				</html>
		`);
	}
);

APP.get(
   '/autos/:merk',
    (req, res) => {
       console.log(req.params.merk);
       let RESULT = DATA.find(
           (el)=>{
             return el.merk.toLowerCase() == req.params.merk.toLowerCase()
           }
       );

       RESULT = RESULT!=undefined?RESULT:{ Fout: 'Geen data gevonden' };

       res.status(200).send(
           // return opgevraagde auto
           RESULT
       );
    }
);


APP.post(
	'/autos/new',
	(sentData,res) => {
		console.log(sentData);
		
		DATA.push(sentData)
		
		res.status(200).send(
			"hai"
		);
		
	}
);