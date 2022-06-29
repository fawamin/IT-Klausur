


class Bundestag {

    INDEX = 0
    /** URL of the feed. */
    // URL = "podcast.rss"
    URL = `https://webtv.bundestag.de/player/macros/_v_q_2192_de/_s_podcast_skin/_x_s-144277506/bttv/podcast.xml`



    /**
     * Lade den Feed.
     * @param {*} show Wenn 0, dann zeige den ersten Beitrag an; sonst den letzten (nur für Bonusaufgabe relevant).  
     */
    load(show = 0) {
        fetch(this.URL)
            .then(response => response.text())
            .then(text => (new window.DOMParser()).parseFromString(text, "text/xml"))
            .then(data => {
                /** Link zur vorherigen Seite des Feeds */
                this.PREV = data.querySelector("link[rel='previous']")?.getAttribute("href")
                /** Link zur nächsten Seite des Feeds */
                this.NEXT = data.querySelector("link[rel='next']")?.getAttribute("href")

                this.ITEMS = []

                // Existierende Einträge löschen (nur für Bonusaufgabe relevant)
                const toc = document.getElementById("toc")
                while (toc.firstChild) {
                    toc.removeChild(toc.firstChild);
                }

                // Verarbeite Items im Feed
                Array.prototype.slice.call(data.getElementsByTagName('item'))
                    // Achtung: Die Items sind chronologisch rückwärts sortiert
                    .reverse()
                    .forEach((item, index) => {
                        /** URL des Videos */
                        let videoUrl = item.getElementsByTagName('guid')[0].textContent
                        /** Titel des Beitrags */
                        let title = item.getElementsByTagName('title')[0].textContent
                        /** Thema des Beitrags */
                        let description = "Thema: " + item.getElementsByTagName('description')[0].textContent
                        /** Datum des Beitrags */
                        let date = new Date(item.getElementsByTagName('pubDate')[0].textContent)

                        const itemData = {
                            title,
                            description,
                            videoUrl,
                            date
                        }

                        // Füge Item zu Inhaltsverzeichnis hinzu
                        this.addToToc(toc, itemData, index)

                        // Zusätzlich wird eine Liste mit den Einträgen erzeugt. 
                        // Damit kann ohne Umweg über das Inhaltsverzeichnis auf die Daten zugegriffen werden.
                        this.ITEMS.push(itemData)
                    })
            })
            // Starte Wiedergabe des ersten bzw. letzten Eintrags
            .then(() => this.setCurrent(show == 0 ? 0 : this.ITEMS.length - 1))
    }

    /** Füge einen Eintrag (li Element) zu {@link itemData} in das Inhaltsverzeichnis ein!
     * @todo
     * 
     *  TIPP: Mit {@link Element.insertAdjacentHTML()} ist das ein Einzeiler!
     *  
     * @param toc Liste, die das Inhaltsverzeichnis aufnimmt
     * @param itemData aufzunehmender Redebeitrag
     * @param index des Eintrags in {@link ITEMS} (TIPP: ist nützlich für die Navigation)
     */
    addToToc(toc, itemData, index) {
       //Element erstellen
       toc.insertAdjacentHTML('beforeend', `<li id = "${index}">${itemData.title}</li>`);
       //Click listener um zu element zu wechseln
       document.getElementById(index).addEventListener('click', () => {
        this.setCurrent(index);
       });
    }
    /**
     * Ensure an element is visible inside a scrollable container.
     * @param {*} container 
     * @param {*} element 
     * @see https://stackoverflow.com/questions/16308037/detect-when-elements-within-a-scrollable-div-are-out-of-view
     */
    ensureInView(container, element) {

        //Determine container top and bottom
        let cTop = container.offsetTop + container.scrollTop
        let cBottom = cTop + container.clientHeight

        //Determine element top and bottom
        let eTop = element.offsetTop
        let eBottom = eTop + element.clientHeight

        //Check if out of view
        if (eTop < cTop) {
            container.scrollTop -= (cTop - eTop)
        }
        else if (eBottom > cBottom) {
            container.scrollTop += (eBottom - cBottom)
        }
    }

    /**
     * Setze den Index des aktuellen Beitrags
     * @param {*} index 
     */
    setCurrent(index) {
        const toc = document.getElementById('toc')

        //Reset the background color of the old item
        var oldelement = document.getElementById(this.INDEX);
        oldelement.style.backgroundColor = "white";
        oldelement.style.borderLeft = "none"


        this.INDEX = index

        document.getElementById("video").src = this.ITEMS[index].videoUrl
        document.getElementById("video").hidden = false
        document.getElementById("video").play()


        //Titel und Beschreibung setzen
        document.getElementById("title").innerHTML = this.ITEMS[index].title;
        document.getElementById("description").innerHTML = this.ITEMS[index].description;

        //Update the Backround color and border of currently selected Entry
        var newelement = document.getElementById(index);
        newelement.style.backgroundColor = "lightgray";
        newelement.style.borderLeft = "4pt solid rgb(94,4,132)" ;
    }

    /**
     * Sets to next Entry in the Feed.
     */
    nextentry()
    {
        this.setCurrent(this.INDEX + 1);
        this.ensureInView(document.getElementById('toc'), document.getElementById(this.INDEX));
    }

    /** Sets to the Prevous entry in the feed */
    previousentry()
    {
        if(this.INDEX > 0)
        {
            this.setCurrent(this.INDEX - 1);
            this.ensureInView(document.getElementById('toc'), document.getElementById(this.INDEX));
        }
    }
}


const bundestag = new Bundestag();

window.addEventListener('DOMContentLoaded', () => {
    //Navigationsbuttons
    document.getElementById('prev').addEventListener('click', () => {
        bundestag.previousentry();
    });
    document.getElementById('next').addEventListener('click', () => {
        bundestag.nextentry();
    });
    //Autoplay nach videoende
    document.getElementById("video").addEventListener("ended", () =>{
        bundestag.setCurrent(bundestag.INDEX + 1);
    });

});
