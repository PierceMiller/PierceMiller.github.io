(function(){

    window.playAnimation = function() {
            
        var stage = document.querySelectorAll( ".pokonami" )[0];

        stage.innerHTML = `
            <i class="sprite ash">
                <i></i> <quote class="exclamation"></quote>
            </i>
            <i class="sprite pokemon pikachu">
                <i></i> <quote class="love"></quote>
            </i>
            <i class="sprite pokemon togepi move">
                <i></i> <quote class="love"></quote>
            </i>
            <div class="pokemons">
            </div>
        `;

        var pokemons = {
            common: [

                "pidgey", 
                "spearow", 
                "nidoran-f", 
                "nidoran-m", 
                "rattata", 
                "sentret",
                "oddish", 
                "geodude",  
                "mareep"

            ],

            uncommon: [

                "ekans", 
                "sandshrew", 
                "bellsprout",
                "caterpie", 
                "weedle",
                "paras", 
                "zubat", 
                "venonat", 
                "vulpix", 
                "jigglypuff", 
                "ledyba", 
                "flaafy", 
                "clefairy", 
                "spinarak", 
                "marill", 
                "hoppip", 
                "growlithe", 
                "phanpy",
                "cubone", 
                "poliwag",  
                "eevee", 
                "abra"

            ],

            rare: [

                "beedrill", 
                "butterfree",
                "pidgeotto", 
                "dratini",
                "miltank"

            ],

            flying: "beedrill butterfree pidgeotto ledyba zubat"

        };

        function getY( pokemon ) {
            if( pokemons.flying.indexOf( pokemon ) >= 0 ) {
                return (( Math.random() * 3 ) + 11).toFixed(2);
            } else {
               return  (( Math.random() * 3 ) + 9).toFixed(2);
            }
        }

        function getZ( y ) {
            return Math.floor((20 - y) * 100);
        }

        function randomPokemon( type ) {
            return pokemons[type][ Math.floor( Math.random() * pokemons[type].length ) ];
        }

        function makePokemon( type ) {

            var xDelay = ( type === "common" ) ? 0 : ( type === "uncommon" ) ? 0.4 : 0.8;
            var delay = "-webkit-animation-delay: " + ( Math.random() * 1.7 + xDelay ).toFixed(3) + "s;";
            var pokemon = randomPokemon( type );
            var bottom = getY( pokemon );
            var y = "bottom: "+ bottom +"%;";
            var z = "z-index: "+ getZ( bottom ) + ";";
            var style = "style='"+delay+" "+y+" "+z+"'";

            return "" + 
                "<i class='sprite pokemon move " + pokemon + "' "+ style + ">" + 
                    "<i style='"+ delay + "'></i>" + 
                "</i>";
        }

        var commons = Math.floor( Math.random() * 25 ) + 25;
        var uncommons = Math.floor( Math.random() * 5 ) + 8;
        var rares = 4;

        var container = document.querySelectorAll(".pokemons")[0];
        var horde = "";

        for ( i = 0 ; i < commons ; i++ ) {
            horde += makePokemon( "common" );
        }

        for ( i = 0 ; i < uncommons ; i++ ) {
            horde += makePokemon( "uncommon" );
        }

        for ( i = 0 ; i < rares ; i++ ) {
            horde += makePokemon( "rare" );
        }
        
        if ( document.querySelectorAll("h3").length ) {
            document.querySelectorAll("h2")[0].classList.add("show");
            document.querySelectorAll("h3")[0].classList.add("hide");
        }
        
        container.innerHTML = horde;

    }

    document.body.onload = window.playAnimation;

}());