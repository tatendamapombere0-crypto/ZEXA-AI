"""
scripts/subject_pools_primary.py
Curated question banks for Grade 7 Primary HBC:
- Chishona (7040/1 & 7040/2)
- English (7010/1 & 7010/2)
- Mathematics (7020/1 & 7020/2)
- Agric, Science & Tech (7030/1 & 7030/2)
- Social Science (7050/1 & 7050/2)
- Physical Education & Arts (7130/1 & 7130/2)
"""

import random

# ==============================================================================
# CHISHONA QUESTION POOLS
# ==============================================================================

CHISHONA_TSUMO = [
    ("Chara chimwe", "hachitswanyi inda", ["hachitswanyi inda", "chinorima munda", "chinovaka musha", "chinotakura mutoro"], "A", "Tsumo inoti 'Chara chimwe hachitswanyi inda'. Zvinoreva kuti munhu mumwe chete haagoni kuita basa guru ari ega; vanhu vanofanira kubatsirana (mushandirapamwe)."),
    ("Mviromviro yemhanza", "mapfeka", ["mapfeka", "bvudzi", "misodzi", "mbonje"], "A", "Tsumo inoti 'Mviromviro yemhanza mapfeka'. Zvinoreva kuti zvinhu zvikuru kana zvakaipa zvinotanga zvishoma zvishoma."),
    ("Kandiro kanoenda", "kunobva kamwe", ["kunobva kamwe", "kure", "kuchoto", "mumunda"], "A", "Tsumo inoti 'Kandiro kanoenda kunobva kamwe'. Inotidzidzisa tsika yekubatsirana nekudyidzana nekuwadzana nevavakidzani."),
    ("Totenda maruva", "tadya chakata", ["tadya chakata", "kwaedza", "kwanaya", "tazviguta"], "A", "Tsumo inoti 'Totenda maruva tadya chakata'. Inoreva kuti usafare nezviratidzo zvisati zvabereka zvibereko chaizvo zvinobatika."),
    ("Aive madziva", "ava mazambuko", ["ava mazambuko", "ava matope", "apwa", "adzika"], "A", "Tsumo inoti 'Aive madziva ava mazambuko'. Zvinoreva kuti upenyu hunochinja, akanga ari mupfumi anogona kuva murombo kana kuti zvinhu zvakanga zvakaoma zvinoita nyore."),
    ("Chakafukidza dzimba", "matenga", ["matenga", "rukisva", "huswa", "marara"], "A", "Tsumo inoti 'Chakafukidza dzimba matenga'. Zvinoreva kuti zvinoitika mumhuri zvemukati hazvizivikanwe nevanhu vekunze."),
    ("Nzombe huru", "yakabva mumhuru", ["yakabva mumhuru", "inodya huswa", "inorima zvakasimba", "inorema"], "A", "Tsumo inoti 'Nzombe huru yakabva mumhuru'. Zvinoreva kuti munhu wese ane mukurumbira akatanga ari mudiki asingazivikanwe."),
    ("Kakara kununa", "hudya kamwe", ["hudya kamwe", "kuguta", "kufamba", "kugara musango"], "A", "Tsumo inoreva kuti munhu anobudirira kuburikidza nekushandira pamwe kana kuwana rubatsiro kubva kune vamwe."),
    ("Mbudzi kuzvarira pavanhu", "huda kurwirwa", ["huda kurwirwa", "kutya chikara", "kushaya pekugara", "kuda kudya"], "A", "Zvinoreva kuti munhu paanotambudzika pamberi pevamwe anenge achitsvaga rubatsiro."),
    ("Rume rimwe", "harikombi churu", ["harikombi churu", "harivaki musha", "haridyi sadza", "haritongi mhuri"], "A", "Munhu mumwe chete haakwanisi kuita basa rinoda vanhu vakawanda ari ega."),
    ("Kure kwemeso", "nzeve dzinonzwa", ["nzeve dzinonzwa", "muromo unotaura", "tsoka dzinofamba", "mwoyo unoziva"], "A", "Kunyange zvinhu zvisingaoneki nameso zvinogona kunzwika nezvenhau."),
    ("Chirere mangwana", "chigozokurerawo", ["chigozokurerawo", "chigokura", "chigofara", "chigokuchengeta"], "A", "Chengeta vana zvakanaka kuti mangwana vakure vachizokuchengetawo paucheche hwako."),
    ("Apunyaira", "haashaye katonje", ["haashaye katonje", "haashaye mufaro", "haashaye mari", "anowira pasi"], "A", "Munhu anobata basa nesimba haashaye chidiki chinomuraramisa muupenyu."),
    ("Gudo guru peta muswe", "kuti vadiki vakutye", ["kuti vadiki vakutye", "kuti ukwire gomo", "kuti udye muchero", "kuti ugare pasi"], "A", "Mukuru anofanira kuzvininipisa kuitira kuti ave muenzaniso wakanaka kuvadiki."),
    ("Kuverengera", "kwakaurayisa gava", ["kwakaurayisa gava", "kwakaipisisa", "kunorasa nguva", "kunopedza simba"], "A", "Kunonoka kuita sarudzo panguva yakakodzera kunogona kuunza njodzi huru."),
    ("Muromo chipfuto", "unozvidyira", ["unozvidyira", "unotaura zvakaipa", "unotuka vanhu", "unofadza"], "A", "Munhu anozvipinza mumatambudziko nekuda kwemashoko anobuda mumuromo make."),
    ("Mwana washe", "muranda kumwe", ["muranda kumwe", "haatongwi", "anoremekedzwa", "anodya zvake"], "A", "Kunyange uchiremekedzwa kumusha kwenyu, kune imwe nzvimbo uri munhuwo zvake."),
    ("Chinono chinengwe", "bere rakadya richifamba", ["bere rakadya richifamba", "chinounza rushambwa", "chinononoka", "chinorwisa"], "A", "Kuva nemaitiro akatsiga nekungwarira kunoita kuti usakurumidza kuwira munjodzi."),
    ("Regai dzive shiri", "mazai haana muto", ["mazai haana muto", "dzibhururuke", "dzikure", "dzidye michero"], "A", "Siya zvinhu zvimboibva pachinzvimbo chekumhanyira zvisati zvagadzirira."),
    ("Seka hurema", "wafa", ["wafa", "wakura", "wakwegura", "wazviguta"], "A", "Usatuka kana kuseka munhu ane chirema nekuti iwe unogona kuzosanganawo nenhamo."),
    ("Ateya mariva", "murutsva haatyi kusviba magaro", ["murutsva haatyi kusviba magaro", "anobata mbeva", "anofara zvikuru", "anomhanya"], "A", "Munhu azvipira kuita basa akaoma anofanira kutarisana nematambudziko aro asina kugunun'una."),
    ("Chawawana batisisa", "mudzimu haupi kaviri", ["mudzimu haupi kaviri", "chinokosha", "usarasire", "chichengete"], "A", "Koshesa mukana wese waunowana nekuti unogona kusazouya zvakare."),
    ("Chitema hachidzime", "chinoramba chiripo", ["chinoramba chiripo", "chinopera", "chinokanganikwa", "chinodzimwa nemvura"], "A", "Mhosva kana chakaipa chakaitwa hachingovhiringidzwe nenguva chiripo kusvikira charipwa."),
    ("Dai ndakaziva", "haitungamiri", ["haitungamiri", "haibatsiri", "inononoka", "inozivisa"], "A", "Kudemba kunouya mushure mekunge zvinhu zvatosakara kana kuparara."),
    ("Gudo harina", "muzukuru", ["muzukuru", "muswe", "nzara", "shamwari"], "A", "Munhu asina musoro netsika haana tsitsi kana nehukama hwake."),
    ("Hove dzinofamba", "nedziri pamhiri", ["nedziri pamhiri", "nedziri mumucheto", "nedziri pasi", "nedziri pamusoro"], "A", "Vanhu vanotevedzera zvinoitwa nevamwe vavo vanotungamira."),
    ("Kare haagari", "ari kare", ["ari kare", "mumba", "mumunda", "musango"], "A", "Zvinhu zvinochinja nenguva; mazuva ano haana kufanana neakapfuura."),
    ("Kukwira gomo", "kwakubva pasi", ["kwakubva pasi", "kusimba", "kutsungirira", "kusakanda mapfumo pasi"], "A", "Kubudirira chero kupi zvako kunotanga kubva panzvimbo yakaderera kwazvo."),
    ("Kukurukura", "hunge wapotswa", ["hunge wapotswa", "hunge wararama", "hunge wafara", "hunge wadya"], "A", "Munhu anotaura nyaya yenjodzi chete kana akwanisa kupukunyuka mairi."),
    ("Kurera imbwa", "nemukaka mangwana inokuruma", ["nemukaka mangwana inokuruma", "kuitadzisa kuvhima", "kuitengesa kure", "kuitambisa"], "A", "Kuitira mutsa munhu asina rutendo kunogona kuzokukonzera nhamo kumberi."),
    ("Kusatenda", "huroyi", ["huroyi", "chitema", "urombo", "kunyara"], "A", "Munhu anopihwa rubatsiro asingatendi akafanana nemuroyi anorwisa vanhu."),
    ("Kutema tsanga", "kudana vamwe", ["kudana vamwe", "kuzvifadza", "kutya mhuka", "kutsamwa"], "A", "Mabasa anorema anoda kubatana kwevanhu vakawanda kuitira kuti akurumidze kupera."),
    ("Makudo ndimamwe", "makwati anotswanya", ["makwati anotswanya", "marudzi akasiyana", "anotya vanhu", "anofamba pamwe"], "A", "Munhu haafaniri kupomera vamwe mhosva iye achiita zvimwe chete zvakashata."),
    ("Mandikurumidze", "akazvara mandinonoke", ["akazvara mandinonoke", "akabata hove", "akakunda vamwe", "akarima munda"], "A", "Kumhanyira kuita zvinhu usina kuronga kunounza kunonoka nekurasikirwa."),
    ("Mazvokuda", "maronda enyora", ["maronda enyora", "maronda ekurwa", "maronda ekutsamwa", "maronda ekugumbuka"], "A", "Matambudziko anounzwa nekuzvisarudzira kwemunhu haafaniri kuchemerwa kune vamwe."),
    ("Mbeva zhinji", "hadzina mashe", ["hadzina mashe", "hadzirari", "hadzidyi nzungu", "hadzivaki mwena"], "A", "Vanhu vakawanda vakaita musangano vasina mutungamiri akasimba vanopedzisira vasina chabuda."),
    ("Mbudzi kudya mupfudze", "kudada nomuridzi wayo", ["kudada nomuridzi wayo", "kushaya huswa", "kunzwa nzara", "kutya zvikara"], "A", "Munhu anoita zvisakarurama achivimba nekuti ane mutsigiri ane simba kumashure kwake."),
    ("Mhanza", "isina mukombero", ["isina mukombero", "ine marwadzo", "ine bvudzi", "inopenya"], "A", "Nhamo inouya kune munhu asina wekumurwira kana mutsigiri."),
    ("Mhuno yomuranda", "inorumirwa kure", ["inorumirwa kure", "haiteereri", "haione chinhu", "inonyara"], "A", "Munhu akaderera haaregererwi zviri nyore kana akanganisa."),
    ("Mwana asingachemi", "anofira mumbereko", ["anofira mumbereko", "haarari", "haaguti", "haaremekedzwi"], "A", "Kana munhu asina kutaura zviri kumunetsa hakuna anoziva zvekuita kuti amubatsire."),
    ("Nzou hairemerwi", "nenyanga dzayo", ["nenyanga dzayo", "nemuviri wayo", "nemhuru yayo", "nenzeve dzayo"], "A", "Munhu haatadzi kutakura matambudziko emhuri yake kana vana vake."),
    ("Pfuma", "yenhaka inoparara", ["yenhaka inoparara", "yemuchato", "yemuranda", "yemunhu"], "A", "Pfuma yawakawana usina kushandira inongoparara pasina nguva."),
    ("Rinonyenga rinohwirira", "rinowana rinosimudza musoro", ["rinowana rinosimudza musoro", "rinotya", "rinonyara", "rinochema"], "A", "Munhu anenge achitsvaga chimwe chinhu anozvininipisa, asi akachiona anozvikudza."),
    ("Rugare", "tange nhamo", ["tange nhamo", "rwakanaka", "rwunodya sadza", "rwunopera"], "A", "Kuti munhu azonakidzwa nehupenyu anofanira kutanga ashanda nesimba nekutamburira hupenyu hwacho."),
    ("Sekuru", "muzariramhamha", ["muzariramhamha", "anopa zano", "anoremekedzwa", "mukuru wemusha"], "A", "Sekuru munhu akakosha kwazvo muupenyu hwechivanhu nekuda kwezano nekuyananisa."),
    ("Shungu", "hadzindisi kure", ["hadzindisi kure", "dzinoparadza", "dzinovaka", "dzinorwisa"], "A", "Kutsamwa pasina zano hakuna kwakunombosvitsa munhu."),
    ("Tsindi yakadya", "yakaenda mugwenzi", ["yakaenda mugwenzi", "yakasungwa", "yakafara", "yakaguta"], "A", "Munhu anenge apedza basa rake anongozorora kana kuenda zvake."),
    ("Ukama", "igasho hunosukwa", ["igasho hunosukwa", "ndihwo hupenyu", "husingapere", "hwakaoma"], "A", "Hukama hunoda kugara huchichengetedzwa nekushanyirana nekuyananisana.")
]

CHISHONA_MADIMIKIRA = [
    ("Kurova pasi nebvi", "Kupfugama uchikumbira ruregerero kana rukudzo", ["Kupfugama uchikumbira ruregerero kana rukudzo", "Kurova munhu neshungu", "Kumhanya kwazvo", "Kurwara nemakumbo"], "A", "Dimikira rekuti 'kurova pasi nebvi' rinoreva kupfugama uchikumbira ruregerero kana kupa rukudzo rukuru kuvakuru."),
    ("Kuisa maoko", "Kukorokotedza kana kubata maoko pamatambudziko", ["Kukorokotedza kana kubata maoko pamatambudziko", "Kushanda nesimba", "Kurova mbama", "Kunyara kutaura"], "A", "Kupa ruremekedzo, kukorokotedza kana kunyaradza vafirwa."),
    ("Kubata kumeso", "Kunyengedza kana kuitira munhu chitsotsi", ["Kunyengedza kana kuitira munhu chitsotsi", "Kugeza chiso", "Kukwazisa vanhu", "Kuchema zvakanyanya"], "A", "Dimikira rekuti 'kubata kumeso' rinoreva kunyengedza mumwe munhu zviri pachena."),
    ("Kuva nemoyo murefu", "Kutsungirira nekusatsamwa nekuchimbidza", ["Kutsungirira nekusatsamwa nekuchimbidza", "Kufara nguva dzose", "Kurwara nemwoyo", "Kuva nehasha"], "A", "Moyo murefu zvinoreva kuva nemaitiro ekugadzikana nekutsungirira."),
    ("Kudyira mukanwa sembwa", "Kutadza kuchengetedza zvekushandisa remangwana", ["Kutadza kuchengetedza zvekushandisa remangwana", "Kudya zvakawanda", "Kuba chikafu", "Kunyima vamwe"], "A", "Dimikira rinoreva kupedza zvese zvawanikwa pasina kurongera ramangwana."),
    ("Kubereka tsoka", "Kutiza zvine simba kana nekukurumidza", ["Kutiza zvine simba kana nekukurumidza", "Kufamba zvishoma", "Kuremara tsoka", "Kutenga shangu"], "A", "Kubereka tsoka zvinoreva kutiza zvine mutsindo uchitya njodzi."),
    ("Kupa gotsi", "Kusiya nzvimbo kana kufuratira mumwe munhu", ["Kusiya nzvimbo kana kufuratira mumwe munhu", "Kurova musoro", "Kutarisisa pamberi", "Kurara hope"], "A", "Kupa gotsi zvinoreva kufuratira munhu kana kumusiya achitaura."),
    ("Kuvhura maziso", "Kudzidza nekuziva zvinhu zvakajeka", ["Kudzidza nekuziva zvinhu zvakajeka", "Kupepuka kuhope", "Kuona chishamiso", "Kutsamwira munhu"], "A", "Kuvhurika pfungwa nekunzwisisa chokwadi chehupenyu."),
    ("Kutsika madziro", "Kuramba mhosva zvakasimba zvisina musoro", ["Kuramba mhosva zvakasimba zvisina musoro", "Kupinda mumba", "Kuvaka rusvingo", "Kugadzira denga"], "A", "Kuramba chokwadi zvine nharo."),
    ("Kuva nenzeve dzinodzoka", "Kuteerera nekutsiurika zviri nyore", ["Kuteerera nekutsiurika zviri nyore", "Kuhwa zvakaoma", "Kuva nezeve huru", "Kusateerera vabereki"], "A", "Munhu anoteerera kurairwa nekutsiurwa anonzi ane nzeve dzinonzwa."),
    ("Kukanda mapfumo pasi", "Kukundwa kana kurega kurwa/kupikisa", ["Kukundwa kana kurega kurwa/kupikisa", "Kukunda muhondo", "Kuvhima mhuka", "Kuchengeta zvombo"], "A", "Kubvuma kuti wakundwa nekurega kuramba uchipikisa."),
    ("Kutema vanga", "Kusiya chiratidzo chechigumbu kana kukuvara", ["Kusiya chiratidzo chechigumbu kana kukuvara", "Kuvhiya nyama", "Kutema muti", "Kugadzira chironda"], "A", "Kutadzira munhu zvokuti anoramba achikurangarira nekurwadziwa."),
    ("Kuva neruoko", "Kuva netsika yekuba zvisiri zvako", ["Kuva netsika yekuba zvisiri zvako", "Kuva murimi mukuru", "Kuva nechipo chekudhirowa", "Kurova vamwe"], "A", "Munhu ane ruoko rurefu munhu anoba zvinhu zvevamwe vanhu."),
    ("Kuruma nzeve", "Kuudza munhu chinyakare kana mashoko erunyerekupe zvakavanzika", ["Kuudza munhu chinyakare kana mashoko erunyerekupe zvakavanzika", "Kukurudzira munhu kurwa", "Kutyisa munhu", "Kuruma nhengo yemuviri"], "A", "Kupa mumwe munhu ruzivo rwakakosha muchivande."),
    ("Kupfeka magirazi matema", "Kusada kuona chokwadi chiri pachena", ["Kusada kuona chokwadi chiri pachena", "Kuzvidzivirira kuzuva", "Kufamba murima", "Kupfeka zvakanaka"], "A", "Kunyepedzera kusaona zvinhu zviri kuitika."),
    ("Kuita mwoyo chena", "Kuva nemutsa nerudo rwakadzama kune vamwe", ["Kuva nemutsa nerudo rwakadzama kune vamwe", "Kuchena pamuviri", "Kupfeka zvakachena", "Kuseka pachena"], "A", "Munhu ane mwoyochena anobatsira vanoshaya achifara."),
    ("Kurova guva", "Kugadzira basa rechivanhu rekuyeuka mufi", ["Kugadzira basa rechivanhu rekuyeuka mufi", "Kupwanya makuva", "Kuviga mutumbi", "Kuchema rufu"], "A", "Mutambo wekudzosa mweya wemufi mumusha maererano netsika dzechivanhu."),
    ("Kukoromoka kwemugomo", "Kufa kwemunhu ane mbiri kana mutungamiri mukuru", ["Kufa kwemunhu ane mbiri kana mutungamiri mukuru", "Kudonha kwedombo", "Kutiza munjodzi", "Kuparara kwemisha"], "A", "Mashoko ekuremekedza anotaura nezvekufa kwamambo kana munhu ane mukurumbira."),
    ("Kuva neziso", "Kukwanisa kuona zvakanaka zvakavanzika kana chitsotsi", ["Kukwanisa kuona zvakanaka zvakavanzika kana chitsotsi", "Kukuvadza ziso", "Kutarisa vanhu", "Kupfeka magirazi"], "A", "Kuve neungwaru hwekusatengeswa musaga."),
    ("Kudya magaka mambishi", "Kusangana nematambudziko anorwadza kwazvo", ["Kusangana nematambudziko anorwadza kwazvo", "Kudya muriwo usina kubikwa", "Kuvengwa nevamwe", "Kuguta chikafu"], "A", "Kupinda munhamo huru inorwadza.")
]

CHISHONA_UKAMA = [
    ("Mwana wehanzvadzi yaamai vako unomuti chii?", "Muzukuru", ["Muzukuru", "Sekuru", "Tete", "Babamudiki"], "A", "Hanzvadzi yaamai vako ndisekuru, vana vavo vanonzi vazukuru."),
    ("Mukoma wababa vako unomuti chii?", "Babamukuru", ["Babamukuru", "Babamudiki", "Sekuru", "Tezvara"], "A", "Mukoma wababa vanonzi Babamukuru."),
    ("Munin'ina wababa vako unomuti chii?", "Babamudiki", ["Babamudiki", "Babamukuru", "Sekuru", "Mukuwasha"], "A", "Munin'ina wababa anonzi Babamudiki."),
    ("Hanzvadzi yababa vako unomuti chii?", "Tete", ["Tete", "Amai", "Mbuya", "Muroora"], "A", "Hanzvadzi yababa vanonzi Tete."),
    ("Hanzvadzi yaamai vako unomuti chii?", "Sekuru", ["Sekuru", "Babamudiki", "Tezvara", "Sahwira"], "A", "Hanzvadzi yaamai vanonzi Sekuru."),
    ("Mukadzi wemukoma wako unomuti chii?", "Muroora", ["Muroora", "Muramu", "Tete", "Hanzvadzi"], "A", "Mukadzi wemukoma mumba anonzi muroora."),
    ("Murume wehanzvadzi yako unomuti chii?", "Mukuwasha", ["Mukuwasha", "Tezvara", "Sekuru", "Muzukuru"], "A", "Murume wehanzvadzi yako anonzi mukuwasha."),
    ("Amai vaamai vako unovadana kuti chii?", "Mbuya", ["Mbuya", "Tete", "Amai", "Muroora"], "A", "Amai vaamai vako vanonzi mbuya."),
    ("Baba vababa vako unovadana kuti chii?", "Sekuru", ["Sekuru", "Babamukuru", "Tezvara", "Sahwira"], "A", "Baba vababa vako vanonzi sekuru."),
    ("Mukadzi wemunin'ina wako unomuti chii?", "Muroora", ["Muroora", "Muramu", "Hanzvadzi", "Mbuya"], "A", "Mukadzi wemunin'ina anonzi muroora."),
    ("Munhu anoseka newe nekukuperekedza pamatambudziko nezvirango anonzi chii?", "Sahwira", ["Sahwira", "Mukuwasha", "Muvengi", "Muranda"], "A", "Sahwira munhu anodyidzana nemhuri ane mvumo yekuseka nekuyananisa."),
    ("Baba vemukadzi wako unovadana kuti chii?", "Tezvara", ["Tezvara", "Sekuru", "Babamukuru", "Sahwira"], "A", "Baba vemukadzi wako vanonzi Tezvara."),
    ("Amai vemukadzi wako unovadana kuti chii?", "Ambuya", ["Ambuya", "Tete", "Amai", "Muroora"], "A", "Amai vemukadzi vanonzi Ambuya."),
    ("Munin'ina wemukadzi wako unomuti chii?", "Muramu", ["Muramu", "Muroora", "Hanzvadzi", "Tete"], "A", "Munin'ina kana hanzvadzi yemudzimai inonzi muramu."),
    ("Mukoma wamai vako unomuti chii?", "Amaiguru", ["Amaiguru", "Amainsini", "Tete", "Mbuya"], "A", "Mukoma wamai wako anonzi amaiguru."),
    ("Munin'ina wamai vako unomuti chii?", "Amainsini", ["Amainsini", "Amaiguru", "Tete", "Muroora"], "A", "Munin'ina wamai vako anonzi amainini/amainsini."),
    ("Vana vemunin'ina wababa vako unovati chii?", "Vakoma nevanin'ina", ["Vakoma nevanin'ina", "Vazukuru", "Hanzvadzi", "Vabereki"], "A", "Mutsika dzechiShona, vana vababa vako vadiki vanonzi vakoma kana vanin'ina vako."),
    ("Vana vatete vako unovati chii?", "Vazukuru", ["Vazukuru", "Vakoma", "Madzibaba", "Madzitete"], "A", "Vana vatete vako vanonzi vazukuru."),
    ("Murume wekutanga wamai vako asiri baba vako unomuti chii?", "Murume wamai", ["Murume wamai", "Babamukuru", "Tezvara", "Mukuwasha"], "A", "Murume anoroora amai asiri baba vekubereka anonzi murume wamai."),
    ("Mukadzi wechipiri wababa vako unomuti chii?", "Amainsini", ["Amainsini", "Muroora", "Tete", "Ambuya"], "A", "Mukadzi wepiri wababa anonzi amainini kana murongo wababa.")
]

CHISHONA_ZVIPFUYO = [
    ("Mwana weshumba anonzi chii?", "Mhanda", ["Mhanda", "Mbudzana", "Nyana", "Mhuru"], "A", "Mwana weshumba anonzi mhanda."),
    ("Mwana wetsuro anonzi chii?", "Handa", ["Handa", "Chikukuvani", "Mhanda", "Mhuru"], "A", "Mwana wetsuro anonzi handa."),
    ("Mwana wembudzi anonzi chii?", "Mbudzana", ["Mbudzana", "Mhuru", "Nhonhongwa", "Nyana"], "A", "Mwana wembudzi anonzi mbudzana."),
    ("Mwana wen'ombe anonzi chii?", "Mhuru", ["Mhuru", "Mbudzana", "Nhonhongwa", "Chikukuvani"], "A", "Mwana wen'ombe anonzi mhuru."),
    ("Mwana weshiri anonzi chii?", "Nyana", ["Nyana", "Mhanda", "Handa", "Mbudzana"], "A", "Mwana weshiri asati ave neminhenga anonzi nyana."),
    ("Mwana wehuku anonzi chii?", "Kukuvani/Chikukuvani", ["Kukuvani/Chikukuvani", "Mhuru", "Mhanda", "Nyana"], "A", "Mwana wehuku anonzi chikukuvani kana kahuku."),
    ("Mwana wengwena anonzi chii?", "Ganyamuto", ["Ganyamuto", "Handa", "Mhuru", "Chikukuvani"], "A", "Mwana wengwena anonzi ganyamuto."),
    ("Mwana wedatya anonzi chii?", "Zunguzurwa", ["Zunguzurwa", "Mhanda", "Mbudzana", "Nyana"], "A", "Mwana wedatya anogara mumvura ane muswe anonzi zunguzurwa."),
    ("Imbwa inorira ichiita sei?", "Kuhukura", ["Kuhukura", "Kukukuridza", "Kubovera", "Kuona"], "A", "Inzwi rembwa rinonzi kuhukura."),
    ("Jongwe rinorira richiita sei?", "Kukukuridza", ["Kukukuridza", "Kuhukura", "Kuchema", "Kurira"], "A", "Jongwe rinokukuridza kwayedza."),
    ("N'ombe inorira ichiita sei?", "Kubovera/Kukuma", ["Kubovera/Kukuma", "Kuhukura", "Kukukuridza", "Kurira"], "A", "Inzwi ren'ombe rinonzi kubovera kana kukuma."),
    ("Shumba inorira ichiita sei?", "Kuona/Kudzvova", ["Kuona/Kudzvova", "Kuhukura", "Kukukuridza", "Kubovera"], "A", "Shumba inodzova kana kuona musango."),
    ("Mbudzi inorira ichiita sei?", "Kuchema/Kubheya", ["Kuchema/Kubheya", "Kuhukura", "Kukukuridza", "Kuona"], "A", "Mbudzi inobheya kana kuchema."),
    ("Mbaura kana dendere nenzvimbo inogara chii?", "Shiri", ["Shiri", "Shumba", "N'ombe", "Mbeva"], "A", "Shiri inovaka dendere mumiti."),
    ("Nzvimbo inorara n'ombe inonzi chii?", "Danga", ["Danga", "Chirugu", "Zumbu", "Bako"], "A", "Nzvimbo inochengeterwa mombe inonzi danga."),
    ("Nzvimbo inorara huku inonzi chii?", "Chirugu/Zumbu", ["Chirugu/Zumbu", "Danga", "Dendere", "Bako"], "A", "Nzvimbo inorara huku inonzi chirugu kana zumbu."),
    ("Nzvimbo inogara shumba musango inonzi chii?", "Bako", ["Bako", "Danga", "Chirugu", "Mwena"], "A", "Shumba inorara mubako mumakomo."),
    ("Mbeva dzinogara mupi muvhu?", "Mumwena", ["Mumwena", "Mudanga", "Mubako", "Mudendere"], "A", "Mbeva dzinochera mwena muvhu."),
    ("Hove dzinogara mupi?", "Mumvura", ["Mumvura", "Mumiti", "Mumabako", "Mudanga"], "A", "Hove dzinorarama mumvura munzizi nemadziva."),
    ("Mwaka wekunaya kwemvura unonzi chii?", "Zhizha", ["Zhizha", "Chando", "Chirimo", "Masutso"], "A", "Zhizha inguva yekunaya kwemvura zvirimwa zvichikura muminda.")
]

CHISHONA_MUTAURO = [
    ("Ishoko ripi rine chirevamwene pamashoko aya: 'Mwana wake anomhanya'?", "wake", ["wake", "Mwana", "anomhanya", "hapana"], "A", "'Wake' rinoratidza mwene wemwana (chirevamwene)."),
    ("Patsanura izwi rekuti 'vakafara' uone chiito:", "fara", ["fara", "va", "ka", "vakafara"], "A", "Chiito ndicho 'fara' chinotaura nezvechiito chekufara."),
    ("Chii chinonzi Chipauro mumutauro wechiShona?", "Izwi rinotsanangura zita", ["Izwi rinotsanangura zita", "Izwi rinoita basa", "Izwi rinotaura nguva", "Izwi remubvunzo"], "A", "Chipauro ishoko rinopa ruzivo rwakadzama kana chimiro chezita (semuenzaniso: mwana murefu)."),
    ("Sarudza zita riri muchikwata chemazita (1/2):", "Murimi", ["Murimi", "Chigaro", "Miti", "Rudo"], "A", "'Murimi' izita remunhu riri muchikwata 1 (Mu-), vawandi vachinzi Varimi (Va-)."),
    ("Izwi rinopesana nerekuti 'kufara' nderekuti chii?", "Kusuruvara", ["Kusuruvara", "Kuseka", "Kudya", "Kutamba"], "A", "Kusuruvara zvinoreva kutsamwa kana kushungurudzika, anopesana nekufara."),
    ("Izwi rinopesana nerekuti 'kupfuma' nderekuti chii?", "Kuromba/Kuuya murombo", ["Kuromba/Kuuya murombo", "Kuguta", "Kuwana", "Kufamba"], "A", "Kupfuma zvinoreva kuva nepfuma yakawanda, kupesana nokuromba kana kushaya."),
    ("Izwi rinoreva zvakafanana nerekuti 'musha' nderekuti chii?", "Mhuri/Kanyi", ["Mhuri/Kanyi", "Munda", "Sango", "Nzizi"], "A", "Musha unogona kunzi kanyi kana nzvimbo yekugara."),
    ("Sarudza chiito mumutsara unoti: 'Vakomana vakarima munda nezuro.'", "vakarima", ["vakarima", "Vakomana", "munda", "nezuro"], "A", "'Vakarima' ndicho chiito chinotaura zvakaitwa nevakomana."),
    ("Chiwedzerwa chekumberi kweshoko chinonzi chii?", "Chivakashure", ["Chivakashure", "Chivakashure/Chirevamwene", "Chitsigiso", "Chindori"], "A", "Chivakashure chinouya pakutanga peshoko kupa revo."),
    ("Ndeipi tsumo inoreva zvakafanana neinoti: 'Chara chimwe hachitswanyi inda'?", "Rume rimwe harikombi churu", ["Rume rimwe harikombi churu", "Mviromviro yemhanza mapfeka", "Mazvokuda maronda enyora", "Mwana washe muranda kumwe"], "A", "Tsumo dzese idzi dzinotidzidzisa nezvekushandira pamwe nekuti munhu mumwe haakwanisi basa guru.")
]

print("Loaded Primary Chishona question templates.")
