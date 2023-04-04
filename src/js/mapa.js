(function() {
    const lat = document.querySelector("#lat").value || 10.2660034;
    const lng = document.querySelector("#lng").value || -68.0149903;
    const mapa = L.map('mapa').setView([lat, lng ], 15);
    let marker;

    //Utilizar Provider y Geocode
    const geocodeService = L.esri.Geocoding.geocodeService()
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    //Pin
    marker = new L.marker([lat, lng], {
        draggable: true, //Permite mover el pin
        autoPan: true   //Al dejar caer el pin se vuelve a centrar
    })
    .addTo(mapa)

    //Detectar el movimiento del pin
    marker.on("moveend", function(e){
        marker = e.target
        const posicion = marker.getLatLng()
        mapa.panTo(new L.latLng(posicion.lat, posicion.lng))

        //Obtener calle y ciudad
        geocodeService.reverse().latlng(posicion, 15).run(function(error, resultado){
            // console.log(resultado)
            marker.bindPopup(resultado.address.LongLabel)

            //Llenar los campos
            document.querySelector(".calle").textContent = resultado?.address?.Address ?? ""
            document.querySelector("#calle").value = resultado?.address?.Address ?? ""
            document.querySelector("#lat").value = resultado?.latlng?.lat ?? ""
            document.querySelector("#lng").value = resultado?.latlng?.lng ?? ""
        })
    })
    

})()