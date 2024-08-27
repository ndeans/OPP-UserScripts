
async function makeCall() {
  let url = "https://vortex.lan:8080/Raven-Jakarta/opp/upload";

  // let headers = new Headers();
  // headers.append('Content-Type', 'application/json');
  // headers.append('Accept', 'text/plain');
  // headers.append('Access-Control-Allow-Origin', '*');

  let headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // 'Access-Control-Allow-Origin': '*',
  })

  let options = {
    method: 'POST',
    headers: headers,
    // mode: 'cors',
    mode: 'no-cors',
    // body: {stuff: "Things"},
    body: JSON.stringify({stuff: "Things"}),  
  };

  try {
    let response = await fetch( url, options );
    // console.log(response.text())
    let data = response.text();
    console.log( data );

  } catch( error ) {

    console.error( error );
  }

}

makeCall();