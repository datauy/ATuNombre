<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>A Tu Nombre</title>
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.2.0/dist/leaflet.css"
   integrity="sha512-M2wvCLH6DSRazYeZRIm1JnYyh22purTM+FDB5CsyxtQJYeKq83arPe5wgbNmcFXGqiSH2XR8dT/fJISVA1r/zQ=="
   crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.2.0/dist/leaflet.js"
  integrity="sha512-lInM/apFSqyy1o6s89K4iQUKg6ppXEgsVxT35HbzUupEVRh2Eu9Wdl4tHj7dZO0s1uvplcYGmt3498TtHq+log=="
  crossorigin=""></script>
</head>
<body>
  <div class="section">
    <div class="container">
      <header class="columns is-mobile">
        <div class="column">
          <img class="logo" src="img/logo_a_tu_nombre.png" alt="A Tu Nombre">
        </div>
        <div class="column">
          <div class="info">?</div>
        </div>
      </header>
    </div>
  </div>
  <div class="section">
    <div class="columns">
      <div class="column">
        <nav class="tabs is-toggle is-fullwidth">
          <ul>
            <li class="is-active"><a>1. Mapa</a></li>
            <li><a>2 .Calles</a></li>
            <li><a>3. Población</a></li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
  <div class="tab section-mapa">
    <?php include 'section-mapa.html'; ?>
  </div>
  <div class="tab section-calles">
    <?php include 'section-calles.html'; ?>
  </div>
  <div class="tab section-poblacion">
    <?php include 'section-poblacion.html'; ?>
  </div>
  <footer class="footer">
    <div class="columns">
      <div class="column datos-abiertos">
        <div class="logo"></div>
        <h1>Acerca de Datos Abiertos</h1>
        <p>El estado recoge y produce datos paracumplir con su función. Su publicación en formatos abiertos permite que sean reutilizados por el gobierno, sociedad civil, organizaciones, empresas o ciudadanos en general.</p>
        <a href="https://www.catalogodatos.gub.uy/">https://www.catalogodatos.gub.uy/</a>
      </div>
      <div class="column datauy">
        <div class="logo"></div>
        <h1>Acerca de DATA</h1>
        <p>Somos una organización de la sociedad civil que trabaja creando herramientas sociales para promover la participación y el debate público a través de la transparencia, datos abiertos y acceso a la información.</p>
        <a href="http://www.datauy.org/">http://www.datauy.org/</a>
      </div>
    </div>
    <div class="columns">
      <div class="column social">
        <div class="twitter">TW</div>
        <div class="facebook">FB</div>
        <div class="github">Fork Me on Github</div>
      </div>
    </div>
  </footer>
  <script src="js/main.js"></script>
</body>
</html>