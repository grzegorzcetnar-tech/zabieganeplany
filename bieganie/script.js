       // NOWA WERSJA: INTELIGENTNY GENERATOR PLANU DLA POCZĄTKUJĄCYCH

        // =======================================================
        // HELPER: getVolumeStatus()
        // Pure Function — określa fizjologiczną ocenę tygodniowej
        // objętości treningowej względem wybranego dystansu docelowego.
        //
        // Progi oparte na minimalnej objętości przygotowawczej:
        //   'danger'  → zbyt mała baza do bezpiecznego ukończenia dystansu
        //   'neutral' → akceptowalne, ale suboptymalne
        //   'optimal' → zakres rekomendowany dla pełnej adaptacji
        // =======================================================
        function getVolumeStatus(distance, vol) {
            const v = parseInt(vol, 10);
            if (isNaN(v)) return 'neutral';

            if (distance === 'mar') {
                if (v < 40)  return 'danger';
                if (v >= 55) return 'optimal';
                return 'neutral';
            } else if (distance === 'hm') {
                if (v < 25)  return 'danger';
                if (v >= 40) return 'optimal';
                return 'neutral';
            } else if (distance === 'k10') {
                if (v < 15)  return 'danger';
                if (v >= 30) return 'optimal';
                return 'neutral';
            }
            return 'neutral';
        }

        // Semantyczny alias dla oceny objętości STARTOWEJ — te same progi fizjologiczne
        // co getVolumeStatus, osobny punkt wywołania dla czytelności w updateVolumeColors().
        function getStartVolumeStatus(distance, vol) {
            return getVolumeStatus(distance, vol);
        }

// Obsługa wyboru metody (UI Logic)
        function selectMethod(methodId, cardElement) {
            // 1. Zdejmij klasę 'active' ze wszystkich kart
            document.querySelectorAll('.method-card').forEach(el => el.classList.remove('active'));
            
            // 2. Dodaj klasę 'active' do klikniętej
            cardElement.classList.add('active');
            
            // 3. Zaznacz ukryty radio button (dla pewności)
            const radio = cardElement.querySelector('input[type="radio"]');
            if(radio) radio.checked = true;
            
            console.log("Wybrano metodę:", methodId);
        }

    

        // =======================================================
        // 1. DATA KERNEL (PEŁNE DANE Z PLIKÓW)
        // =======================================================
        
        // Tabela Referencyjna: Wskaźnik Wydolności (run_index) -> Sekundy dla dystansów
        const refTable = [
            {"v":30,"k5":1840,"k10":3826,"hm":8464,"mar":17357},{"v":31,"k5":1791,"k10":3723,"hm":8241,"mar":16917},
            {"v":32,"k5":1745,"k10":3626,"hm":8029,"mar":16499},{"v":33,"k5":1701,"k10":3534,"hm":7827,"mar":16102},
            {"v":34,"k5":1659,"k10":3446,"hm":7636,"mar":15723},{"v":35,"k5":1620,"k10":3363,"hm":7453,"mar":15363},
            {"v":36,"k5":1582,"k10":3284,"hm":7279,"mar":15019},{"v":37,"k5":1546,"k10":3209,"hm":7114,"mar":14690},
            {"v":38,"k5":1512,"k10":3137,"hm":6955,"mar":14375},{"v":39,"k5":1479,"k10":3069,"hm":6804,"mar":14074},
            {"v":40,"k5":1448,"k10":3003,"hm":6659,"mar":13785},{"v":41,"k5":1418,"k10":2940,"hm":6520,"mar":13508},
            {"v":42,"k5":1389,"k10":2880,"hm":6387,"mar":13241},{"v":43,"k5":1361,"k10":2822,"hm":6260,"mar":12986},
            {"v":44,"k5":1334,"k10":2766,"hm":6137,"mar":12740},{"v":45,"k5":1308,"k10":2712,"hm":6020,"mar":12506},
            {"v":46,"k5":1284,"k10":2660,"hm":5906,"mar":12279},{"v":47,"k5":1260,"k10":2610,"hm":5798,"mar":12061},
            {"v":48,"k5":1237,"k10":2562,"hm":5693,"mar":11851},{"v":49,"k5":1215,"k10":2516,"hm":5592,"mar":11649},
            {"v":50,"k5":1197,"k10":2481,"hm":5495,"mar":11449},{"v":51,"k5":1177,"k10":2438,"hm":5401,"mar":11259},
            {"v":52,"k5":1158,"k10":2396,"hm":5311,"mar":11076},{"v":53,"k5":1138,"k10":2360,"hm":5224,"mar":10899},
            {"v":54,"k5":1120,"k10":2322,"hm":5140,"mar":10731},{"v":55,"k5":1102,"k10":2286,"hm":5058,"mar":10568},
            {"v":56,"k5":1085,"k10":2251,"hm":4979,"mar":10400},{"v":57,"k5":1069,"k10":2217,"hm":4903,"mar":10247},
            {"v":58,"k5":1053,"k10":2184,"hm":4829,"mar":10094},{"v":59,"k5":1037,"k10":2152,"hm":4757,"mar":9947},
            {"v":60,"k5":1023,"k10":2122,"hm":4688,"mar":9805},{"v":61,"k5":1008,"k10":2092,"hm":4620,"mar":9668},
            {"v":62,"k5":994,"k10":2063,"hm":4554,"mar":9534},{"v":63,"k5":980,"k10":2035,"hm":4490,"mar":9404},
            {"v":64,"k5":966,"k10":2008,"hm":4428,"mar":9278},{"v":65,"k5":954,"k10":1981,"hm":4373,"mar":9155},
            {"v":66,"k5":942,"k10":1955,"hm":4316,"mar":9036},{"v":67,"k5":929,"k10":1931,"hm":4260,"mar":8920},
            {"v":68,"k5":918,"k10":1906,"hm":4205,"mar":8807},{"v":69,"k5":905,"k10":1883,"hm":4152,"mar":8697},
            {"v":70,"k5":895,"k10":1860,"hm":4101,"mar":8590} //{"v":71,"k5":858,"k10":1783,"hm":4038,"mar":8550},
            //{"v":72,"k5":846,"k10":1759,"hm":3987,"mar":8451},//{"v":73,"k5":834,"k10":1735,"hm":3938,"mar":8354},
            //{"v":74,"k5":823,"k10":1712,"hm":3889,"mar":8259},//{"v":75,"k5":811,"k10":1689,"hm":3842,"mar":8167},
            //{"v":76,"k5":800,"k10":1666,"hm":3795,"mar":8077},//{"v":77,"k5":789,"k10":1644,"hm":3749,"mar":7988},
            //{"v":78,"k5":778,"k10":1622,"hm":3703,"mar":7900},//{"v":79,"k5":768,"k10":1601,"hm":3658,"mar":7813},
            //{"v":80,"k5":758,"k10":1580,"hm":3614,"mar":7728},//{"v":81,"k5":748,"k10":1559,"hm":3571,"mar":7645},
            //{"v":82,"k5":738,"k10":1539,"hm":3528,"mar":7563},//{"v":83,"k5":728,"k10":1519,"hm":3486,"mar":7482},
            //{"v":84,"k5":719,"k10":1500,"hm":3445,"mar":7402},//{"v":85,"k5":709,"k10":1481,"hm":3404,"mar":7324}
        ];

        // --- START: PACES TABLE CONFIGURATION (SAFE MODE) ---

/**
* BAZA DANYCH TEMP TRENINGOWYCH
* * Struktura oparta na Matrycy Komunikacji:
* - run_index: Wskaźnik Wydolności (klucz główny)
* - run_easy: Bieg Spokojny (budowa bazy tlenowej)
* - run_race_pace: Tempo Startowe (M)
* - run_threshold: Bieg Progowy (próg mleczanowy)
* - run_vo2max: Interwały (strefa VO2max)
* - run_reps: Rytmy (ekonomia biegu) - FORMAT MM:SS (min/km)
*/

const pacesTable = {
30: { run_easy: "07:51", run_race_pace: "06:52", run_threshold: "06:25", run_vo2max: "06:01", run_reps: "05:41" },
31: { run_easy: "07:42", run_race_pace: "06:42", run_threshold: "06:15", run_vo2max: "05:47", run_reps: "05:31" },
32: { run_easy: "07:31", run_race_pace: "06:32", run_threshold: "06:06", run_vo2max: "05:35", run_reps: "05:21" },
33: { run_easy: "07:21", run_race_pace: "06:22", run_threshold: "05:57", run_vo2max: "05:29", run_reps: "05:13" },
34: { run_easy: "07:11", run_race_pace: "06:14", run_threshold: "05:49", run_vo2max: "05:21", run_reps: "05:07" },
35: { run_easy: "07:02", run_race_pace: "06:05", run_threshold: "05:41", run_vo2max: "05:13", run_reps: "04:59" },
36: { run_easy: "06:53", run_race_pace: "05:57", run_threshold: "05:34", run_vo2max: "05:08", run_reps: "04:49" },
37: { run_easy: "06:44", run_race_pace: "05:49", run_threshold: "05:26", run_vo2max: "05:01", run_reps: "04:44" },
38: { run_easy: "06:36", run_race_pace: "05:42", run_threshold: "05:20", run_vo2max: "04:55", run_reps: "04:37" },
39: { run_easy: "06:28", run_race_pace: "05:34", run_threshold: "05:13", run_vo2max: "04:49", run_reps: "04:32" },
40: { run_easy: "06:20", run_race_pace: "05:28", run_threshold: "05:07", run_vo2max: "04:43", run_reps: "04:27" },
41: { run_easy: "06:13", run_race_pace: "05:21", run_threshold: "05:01", run_vo2max: "04:37", run_reps: "04:21" },
42: { run_easy: "06:06", run_race_pace: "05:15", run_threshold: "04:55", run_vo2max: "04:32", run_reps: "04:17" },
43: { run_easy: "05:59", run_race_pace: "05:09", run_threshold: "04:50", run_vo2max: "04:27", run_reps: "04:11" },
44: { run_easy: "05:53", run_race_pace: "05:03", run_threshold: "04:44", run_vo2max: "04:22", run_reps: "04:06" },
45: { run_easy: "05:47", run_race_pace: "04:57", run_threshold: "04:39", run_vo2max: "04:17", run_reps: "04:01" },
46: { run_easy: "05:41", run_race_pace: "04:52", run_threshold: "04:34", run_vo2max: "04:13", run_reps: "03:56" },
47: { run_easy: "05:35", run_race_pace: "04:47", run_threshold: "04:30", run_vo2max: "04:08", run_reps: "03:51" },
48: { run_easy: "05:29", run_race_pace: "04:42", run_threshold: "04:25", run_vo2max: "04:02", run_reps: "03:46" },
49: { run_easy: "05:24", run_race_pace: "04:37", run_threshold: "04:21", run_vo2max: "04:00", run_reps: "03:43" },
50: { run_easy: "05:19", run_race_pace: "04:32", run_threshold: "04:16", run_vo2max: "03:56", run_reps: "03:39" },
51: { run_easy: "05:14", run_race_pace: "04:28", run_threshold: "04:12", run_vo2max: "03:52", run_reps: "03:36" },
52: { run_easy: "05:09", run_race_pace: "04:21", run_threshold: "04:08", run_vo2max: "03:49", run_reps: "03:33" },
53: { run_easy: "05:05", run_race_pace: "04:19", run_threshold: "04:05", run_vo2max: "03:45", run_reps: "03:30" },
54: { run_easy: "05:00", run_race_pace: "04:15", run_threshold: "04:01", run_vo2max: "03:42", run_reps: "03:26" },
55: { run_easy: "04:56", run_race_pace: "04:11", run_threshold: "03:57", run_vo2max: "03:38", run_reps: "03:23" },
56: { run_easy: "04:51", run_race_pace: "04:07", run_threshold: "03:54", run_vo2max: "03:35", run_reps: "03:21" },
57: { run_easy: "04:47", run_race_pace: "04:04", run_threshold: "03:51", run_vo2max: "03:32", run_reps: "03:18" },
58: { run_easy: "04:43", run_race_pace: "04:00", run_threshold: "03:46", run_vo2max: "03:29", run_reps: "03:14" },
59: { run_easy: "04:39", run_race_pace: "03:56", run_threshold: "03:44", run_vo2max: "03:26", run_reps: "03:11" },
60: { run_easy: "04:36", run_race_pace: "03:53", run_threshold: "03:41", run_vo2max: "03:24", run_reps: "03:08" },
61: { run_easy: "04:32", run_race_pace: "03:50", run_threshold: "03:38", run_vo2max: "03:21", run_reps: "03:05" },
62: { run_easy: "04:28", run_race_pace: "03:47", run_threshold: "03:35", run_vo2max: "03:18", run_reps: "03:02" },
63: { run_easy: "04:25", run_race_pace: "03:44", run_threshold: "03:33", run_vo2max: "03:16", run_reps: "03:00" },
64: { run_easy: "04:22", run_race_pace: "03:41", run_threshold: "03:30", run_vo2max: "03:13", run_reps: "02:58" },
65: { run_easy: "04:19", run_race_pace: "03:38", run_threshold: "03:27", run_vo2max: "03:11", run_reps: "02:55" },
66: { run_easy: "04:15", run_race_pace: "03:35", run_threshold: "03:25", run_vo2max: "03:09", run_reps: "02:53" },
67: { run_easy: "04:12", run_race_pace: "03:32", run_threshold: "03:22", run_vo2max: "03:06", run_reps: "02:51" },
68: { run_easy: "04:09", run_race_pace: "03:29", run_threshold: "03:20", run_vo2max: "03:04", run_reps: "02:49" },
69: { run_easy: "04:06", run_race_pace: "03:27", run_threshold: "03:17", run_vo2max: "03:02", run_reps: "02:47" },
70: { run_easy: "04:03", run_race_pace: "03:24", run_threshold: "03:15", run_vo2max: "03:00", run_reps: "02:45" }
};

// --- END: PACES TABLE CONFIGURATION ---

/**
 * Konwertuje tekstowe tempo "MM:SS" na liczbę sekund.
 * Przydatne do obliczeń matematycznych w tle.
 */
const getSecondsFromPace = (paceString) => {
  if (!paceString) return 0;
  const [min, sec] = paceString.split(':').map(Number);
  return (min * 60) + sec;
};
// =======================================================
        
        
        let userRunIndex = 45;

        // =======================================================
        // 2. LOGIKA SILNIKA (Najbliższy Sąsiad)
        // =======================================================
        // Wzorce dni treningowych (0=Wolne, 1=Trening)
        const dayPatterns = {
            2: [0, 0, 0, 0, 1, 0, 1], // Piątek, Niedziela
            3: [0, 1, 0, 1, 0, 0, 1], // Wt, Czw, Nd
            4: [0, 1, 0, 1, 0, 1, 1], // Wt, Czw, Sob, Nd
            5: [0, 1, 1, 1, 0, 1, 1], // Wt, Śr, Czw, Sob, Nd
            6: [0, 1, 1, 1, 1, 1, 1]  // Bez Poniedziałku
        };

        /**
         * Funkcja bierze "Worek treningów" z danego tygodnia i rozkłada go na dni kalendarzowe
         */
        function mapWorkoutsToDays(workoutsPool, daysCount) {
            const pattern = dayPatterns[daysCount] || dayPatterns[5];
            const days = [];
            
            const longRun = workoutsPool.find(w => w.tag === 'L');
            const quality1 = workoutsPool.find(w => w.tag === 'Q');
            const quality2 = workoutsPool.find(w => w.tag === 'Q2'); // Szukamy drugiego akcentu
            const easy = workoutsPool.find(w => w.tag === 'E');

            for (let i = 0; i < 7; i++) {
                // 1. Dzień wolny
                if (pattern[i] === 0) {
                    days.push({ type: 'rest', text: 'Wolne', dist: 0 });
                    continue;
                }

                // 2. NIEDZIELA -> Long Run
                if (i === 6) {
                    days.push({ type: 'long', text: longRun.text, dist: longRun.dist });
                    continue; // Ważne: przerywamy pętlę dla tego dnia
                }

                // 3. LOGIKA AKCENTÓW
                // Pomocnik: buduje obiekt dnia dla akcenty, propagując `steps`
                // jeśli trening pochodzi z generateAdvancedQualityWorkout().
                // Brak `steps` → kompatybilność wsteczna ze statycznymi treningami.
                const makeQualityDay = (w) => {
                    const day = { type: 'quality', text: w.text, dist: w.dist };
                    if (w.steps) day.steps = w.steps;
                    return day;
                };

                // Sytuacja A: Mamy 5 lub 6 dni treningowych (2 akcenty)
                if (daysCount >= 5 && quality2) {
                    if (i === 1) { // WTOREK -> Pierwszy Akcent (Mocniejszy)
                        days.push(makeQualityDay(quality1));
                        continue;
                    }
                    if (i === 3) { // CZWARTEK -> Drugi Akcent (Uzupełniający)
                        days.push(makeQualityDay(quality2));
                        continue;
                    }
                } 
                // Sytuacja B: Mamy 3 lub 4 dni (1 akcent)
                else {
                    // Dla 3/4 dni akcent jest w Czwartek (index 3), żeby oddzielić od Niedzieli
                    if (i === 3 && quality1) {
                        days.push(makeQualityDay(quality1));
                        continue;
                    }
                }

                // 4. Jeśli żaden z powyższych -> Easy Run
                days.push({ type: 'easy', text: easy.text, dist: easy.dist });
            }
            return days;
        }

        // Algorytm Najbliższego Sąsiada
        function parseTime(timeStr) {
            if (!timeStr) return 0;
            const parts = timeStr.split(':').map(Number);
            // Obsługa formatu HH:MM:SS
            if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]; 
            // Obsługa formatu MM:SS
            if (parts.length === 2) return parts[0] * 60 + parts[1]; 
            return 0;
        }
        function findBestRunIndex(sec, distKey) {

            // ── GUARD CLAUSE: Ekstrapolacja dla czasów wolniejszych niż indeks 30 ────
            //
            // Fizjologia → Math: wydolność biegacza jest proporcjonalna do jego prędkości
            // (v = d/t; przy stałym dystansie: v ∝ 1/t).
            // Wyznaczamy deltę prędkości na 1 punkt indeksu (v31 - v30), a następnie
            // sprawdzamy, o ile jednostek prędkości użytkownik jest poniżej v30.
            // Wynik: precyzyjny indeks 15–29 zamiast ślepego "30".
            //
            const t30 = refTable[0][distKey]; // czas dla indeksu 30 (najwolniejszy w tabeli)
            const t31 = refTable[1][distKey]; // czas dla indeksu 31 (kolejny krok)

            if (sec > t30) {
                const v30    = 1 / t30;
                const v31    = 1 / t31;
                const deltaV = v31 - v30;                          // przyrost prędkości / 1 pkt
                const vUser  = 1 / sec;
                const calculatedIndex = 30 - ((v30 - vUser) / deltaV);
                return Math.max(15, Math.round(calculatedIndex));  // podłoga: indeks 15
            }

            // ── STANDARDOWY ALGORYTM: Najbliższy Sąsiad dla czasów w zakresie tabeli ─
            let bestV   = 30;
            let minDiff = Infinity;

            refTable.forEach(row => {
                const rowSec = row[distKey];
                if (rowSec) {
                    const diff = Math.abs(rowSec - sec);
                    if (diff < minDiff) {
                        minDiff = diff;
                        bestV   = row.v;
                    }
                }
            });

            return bestV;
        }

       







        /**
         * Funkcja aktualizująca stan aplikacji po zmianie czasu.
         * UWAGA: Nie wyświetlamy już Wskaźnika Wydolności ani temp w panelu bocznym.
         * Wartość userRunIndex jest aktualizowana globalnie i czeka na kliknięcie "Generuj".
         */
        function updateRunIndexDisplay() {
            console.log(`System calibrated. Internal run_index: ${userRunIndex}`);
            // Nie robimy nic w DOM, bo usunęliśmy tabelę i wskaźnik.
            // PacesTable zostanie użyta dopiero przy generowaniu planu.
        }

        /**
         * Blokuje lub odblokowuje parametry planu zależnie od run_index.
         *
         * Fizjologia → UI: dla run_index < 30 objętość i tryb zaawansowany
         * nie mają zastosowania — silnik adaptacyjny zarządza nimi wewnętrznie.
         * Blokada chroni użytkownika przed ustawieniem wartości sprzecznych
         * z algorytmem (np. 7 dni treningu przy dopiero budowanej bazie tlenowej).
         *
         * @param {number|null} runIndex
         */
        function updateParamsUI(runIndex) {
            // Pobranie elementów wejściowych
            const raceDateInput   = document.getElementById('raceDate');
            const raceDateBox     = raceDateInput.parentElement;

            const targetDistInput = document.getElementById('targetDist');
            const targetDistBox   = targetDistInput.parentElement;
            const currentTarget   = targetDistInput.value;

            const startVol        = document.getElementById('startVol');
            const targetVolInput  = document.getElementById('targetVol');

            const advancedMode    = document.getElementById('advancedMode');
            const modeContainer   = document.getElementById('modeContainer');

            const methodContainer = document.getElementById('methodSelectorContainer');

            const daysSelect      = document.getElementById('daysPerWeek');
            const daysBox         = daysSelect.parentElement;

            const ADAPTIVE_MAX_DAYS = 4;

            // Określenie stanów logicznych
            const minIndexRequired    = { 'k10': 20, 'hm': 25, 'mar': 30 };
            const isElite             = runIndex !== null && runIndex > 70;
            // Jeśli użytkownik jeszcze nie wybrał dystansu, blokujemy diagnozy i adaptacje
            const isBeginnerDiagnosis = currentTarget !== "" && runIndex !== null && runIndex < minIndexRequired[currentTarget];
            const isAdaptive          = currentTarget !== "" && runIndex !== null && runIndex < 30 && !isBeginnerDiagnosis;

            // Reset wszystkich blokad na start (domyślnie pełny dostęp — Stan 4)
            raceDateInput.disabled = false;   raceDateBox.classList.remove('params-adaptive-locked');
            targetDistInput.disabled = false; targetDistBox.classList.remove('params-adaptive-locked');
            startVol.disabled = false;        targetVolInput.disabled = false;
            advancedMode.disabled = false;    modeContainer.classList.remove('params-adaptive-locked');
            if (methodContainer) methodContainer.classList.remove('params-adaptive-locked');
            daysSelect.disabled = false;      daysBox.classList.remove('params-adaptive-locked');
            Array.from(daysSelect.options).forEach(opt => { opt.hidden = false; opt.disabled = false; });

            // ── 1. TRYB ELITY (> 70): TOTALNY LOCKDOWN ─────────────────────
            if (isElite) {
                raceDateInput.disabled = true;   raceDateBox.classList.add('params-adaptive-locked');
                targetDistInput.disabled = true; targetDistBox.classList.add('params-adaptive-locked');
                startVol.disabled = true;        targetVolInput.disabled = true;
                advancedMode.checked = false;    advancedMode.disabled = true;
                modeContainer.classList.add('params-adaptive-locked');
                if (methodContainer) methodContainer.classList.add('params-adaptive-locked');
                daysSelect.disabled = true;      daysBox.classList.add('params-adaptive-locked');
                syncVolumeStepperButtons(startVol);
                syncVolumeStepperButtons(targetVolInput);
                return;
            }

            // ── 2. DIAGNOZA POCZĄTKUJĄCYCH: BLOKADA Z WYJĄTKIEM DYSTANSU ──
            // targetDistInput pozostaje odblokowany — użytkownik musi móc wybrać
            // krótszy dystans, aby wyjść z trybu diagnozy eksperckiej.
            if (isBeginnerDiagnosis) {
                raceDateInput.disabled = true;   raceDateBox.classList.add('params-adaptive-locked');
                startVol.disabled = true;        targetVolInput.disabled = true;
                advancedMode.checked = false;    advancedMode.disabled = true;
                modeContainer.classList.add('params-adaptive-locked');
                if (methodContainer) methodContainer.classList.add('params-adaptive-locked');
                daysSelect.disabled = true;      daysBox.classList.add('params-adaptive-locked');
                syncVolumeStepperButtons(startVol);
                syncVolumeStepperButtons(targetVolInput);
                return;
            }

            // ── 3. TRYB ADAPTACYJNY (< 30): CZĘŚCIOWY LOCKDOWN ────────────────
            if (isAdaptive) {
                startVol.disabled = true;     targetVolInput.disabled = true;
                advancedMode.checked = false; advancedMode.disabled = true;
                modeContainer.classList.add('params-adaptive-locked');
                if (methodContainer) methodContainer.classList.add('params-adaptive-locked');

                Array.from(daysSelect.options).forEach(opt => {
                    const val = parseInt(opt.value, 10);
                    const tooMany = val > ADAPTIVE_MAX_DAYS;
                    opt.hidden = tooMany; opt.disabled = tooMany;
                });
                if (parseInt(daysSelect.value, 10) > ADAPTIVE_MAX_DAYS) daysSelect.value = '3';
            }

            // ── 4. TRYB STANDARDOWY (≥ 30): PEŁNY DOSTĘP ─────────────────────
            // Wszystkie pola już odblokowane przez reset na starcie funkcji.
            syncVolumeStepperButtons(startVol);
            syncVolumeStepperButtons(targetVolInput);
        }
            // =======================================================
// 4. KONTROLER KALIBRACJI FORMY (ZINTEGROWANA LOGIKA)
// =======================================================

// A. Listener zmiany dystansu — jedyne co robi, to wywołuje przeliczenie czasu
document.getElementById('raceType').addEventListener('change', () => {
    document.getElementById('raceTime').dispatchEvent(new Event('change'));
});

// Słownik komunikatów dla biegaczy na poziomie elity (run_index > 70).
// Generator nie wspiera tego pułapu — konieczna jest indywidualna opieka trenera.
const eliteMessages = {
    'k10': "Osiągnąłeś poziom elity sportowej. Trening pod 10 km na tym pułapie wymaga precyzyjnej pracy na bieżni lekkoatletycznej, podwójnych akcentów i indywidualnej analizy biomechanicznej. Generator jest zablokowany, ponieważ uogólnione algorytmy nie mają tu już zastosowania. Potrzebujesz dedykowanego trenera.",
    'hm':  "Biegasz na poziomie wyczynowym. Przygotowanie do półmaratonu przy takich prędkościach opiera się na zaawansowanej manipulacji progiem mleczanowym. Generator jest zablokowany, by chronić Twój rozwój – na tym etapie wymagasz hiper-personalizacji i opieki trenera.",
    'mar': "Prezentujesz poziom zawodniczy. Trening maratoński w tej strefie wymaga precyzyjnego zarządzania glikogenem i obozów klimatycznych. Algorytmy stwarzają tu ryzyko przetrenowania. Generator jest zablokowany – Twój poziom wymaga indywidualnego prowadzenia."
};

// C. Główny, jedyny i ostateczny listener zmiany czasu
document.getElementById('raceTime').addEventListener('change', function() {
    const sec = parseTime(this.value);
    const dist = document.getElementById('raceType').value;
    const warningBox = document.getElementById('runIndexWarning');
    const warningText = document.getElementById('runIndexWarningText');
    const generateBtn = document.querySelector('.btn-generate, .btn-secondary');

    // Krok 1: Zawsze resetuj UI i stan globalny do czystego punktu wyjścia.
    // Fizjologia → State: każda zmiana czasu oznacza nową kalibrację —
    // stary run_index traci ważność do momentu przejścia przez pełny łańcuch warunkowy.
    userRunIndex = null;

    warningBox.classList.remove('active');
    warningBox.style.borderColor = '';
    warningBox.style.background  = '';
    generateBtn.disabled      = false;
    generateBtn.style.opacity = "1";
    generateBtn.onclick       = generateSeasonController;
    generateBtn.className     = 'btn-generate';
    generateBtn.innerHTML     = `<span class="material-symbols-outlined">auto_awesome</span> Generuj Plan Treningowy`;

    // Krok 2: Walidacja zerowego czasu (stan domyślny formularza)
    if (sec === 0) {
        // Pozostawiamy stan "uncalibrated" (userRunIndex = null).
        // NIE wywieszamy od razu błędu. Wyłapie to Agregator Błędów po kliknięciu "Generuj".
        updateParamsUI(null);
        return;
    }

    // Krok 3: Oblicz userRunIndex — Single Source of Truth dla Orkiestratora.
    const fastLimit        = refTable[refTable.length - 1][dist];
    const targetDist       = document.getElementById('targetDist').value;
    const minIndexRequired = { 'k10': 20, 'hm': 25, 'mar': 30 };

    if (sec < fastLimit) {
        // ── STAN 1: POZIOM ELITY (> 70) ──────────────────────────────
        userRunIndex = 71;
        warningBox.classList.remove('active');

        generateBtn.disabled      = true;
        generateBtn.style.opacity = "0.5";

        renderEliteAdvice(dist);

    } else {
        userRunIndex = findBestRunIndex(sec, dist);
        warningBox.classList.remove('active');

        if (targetDist !== "" && userRunIndex < minIndexRequired[targetDist]) {
            // ── STAN 2: DIAGNOZA TRENERSKA ────────────────────────────
            // Wskaźnik zbyt niski dla wybranego dystansu — karta w locie
            generateBtn.disabled      = true;
            generateBtn.style.opacity = "0.5";

            renderExpertAdvice(targetDist, userRunIndex, minIndexRequired[targetDist]);

        } else {
            // ── STAN 3: GOTOWOŚĆ DO TRENINGU (Standard lub Adaptacja) ─
            // Czyścimy diagnozy z głównego widoku — przycisk aktywny
            resetSeasonView();
        }
    }
    
    updateParamsUI(userRunIndex); // Blokuj/odblokuj pola zależnie od run_index
    updateRunIndexDisplay();
});

// =======================================================
// NOWA LOGIKA: Autopilot Daty Startowej
// =======================================================
function calculateOptimalDate(dist) {
    const raceDateInput = document.getElementById('raceDate');
    let optimalWeeks = 0;
    if (dist === 'k10')      optimalWeeks = 12;
    else if (dist === 'hm')  optimalWeeks = 14;
    else if (dist === 'mar') optimalWeeks = 16;

    if (optimalWeeks > 0) {
        const optimalDate = new Date();
        optimalDate.setDate(optimalDate.getDate() + (optimalWeeks * 7));
        raceDateInput.valueAsDate = optimalDate;
    }
    validateRaceDate();
}

function applyAutoDateLogic() {
    const checkbox = document.getElementById('autoDateSwitch');
    const triggerBtn = document.querySelector('.date-trigger-btn');
    const raceDateInput = document.getElementById('raceDate');

    if (checkbox.checked) {
        // Autopilot WŁĄCZONY: Blokada interfejsu kalendarza
        triggerBtn.style.pointerEvents = 'none';
        triggerBtn.style.opacity = '0.4';
        raceDateInput.style.opacity = '0.7';

        // Wymuś optymalną datę dla obecnie wybranego dystansu
        const dist = document.getElementById('targetDist').value;
        if (dist) {
            calculateOptimalDate(dist);
        } else {
            // Brak dystansu -> resetujemy ręcznie wpisaną datę, by uniknąć zawieszenia błędów
            raceDateInput.value = '';
            validateRaceDate(); // Wywołanie walidacji ukryje błędy dla pustego pola
        }
    } else {
        // Autopilot WYŁĄCZONY: Pełna swoboda wyboru
        triggerBtn.style.pointerEvents = 'auto';
        triggerBtn.style.opacity = '1';
        raceDateInput.style.opacity = '1';
    }
}

function toggleAutoDate() {
    const checkbox = document.getElementById('autoDateSwitch');
    checkbox.checked = !checkbox.checked;
    applyAutoDateLogic();
}

// Zmodyfikowany Listener zmiany dystansu
document.getElementById('targetDist').addEventListener('change', function() {
    const autoDateSwitch = document.getElementById('autoDateSwitch');
    // Automatycznie wylicz datę TYLKO wtedy, gdy przełącznik jest włączony
    if (autoDateSwitch && autoDateSwitch.checked) {
        calculateOptimalDate(this.value);
    }
    // Wymuszenie odświeżenia głównego widoku (Diagnozy Trenerskie)
    document.getElementById('raceTime').dispatchEvent(new Event('change'));
});

// Zainicjuj stan "Autopilota" po załadowaniu skryptów
setTimeout(applyAutoDateLogic, 100);

// =======================================================
// WALIDACJA DATY STARTU W LOCIE (Inline Validation M3)
// =======================================================
function validateRaceDate() {
    const raceDateInput  = document.getElementById('raceDate');
    const warningEl      = document.getElementById('dateWarning');
    const warningTextEl  = document.getElementById('dateWarningText');
    const generateBtn    = document.querySelector('.btn-generate');

    if (!raceDateInput.value) {
        warningEl.classList.remove('active');
        return;
    }

    const today       = new Date();
    today.setHours(0, 0, 0, 0);
    const raceDate    = new Date(raceDateInput.value);
    const msPerWeek   = 1000 * 60 * 60 * 24 * 7;
    const weeksToRace = Math.floor((raceDate - today) / msPerWeek);

    if (weeksToRace < 8) {
        warningTextEl.textContent = 'Zbyt wczesny termin. Fizjologiczne minimum na przygotowania to 8 tygodni.';
        warningEl.classList.add('active');
        if (generateBtn) generateBtn.disabled = true;
    } else if (weeksToRace > 22) {
        warningTextEl.textContent = 'Zbyt odległy termin. Maksymalny czas jednego makrocyklu to 22 tygodnie. Zaplanuj cel pośredni.';
        warningEl.classList.add('active');
        if (generateBtn) generateBtn.disabled = true;
    } else {
        warningEl.classList.remove('active');
        if (generateBtn) generateBtn.disabled = false;
    }
}

document.getElementById('raceDate').addEventListener('change', validateRaceDate);

['startVol', 'targetVol'].forEach(id => {
    document.getElementById(id).addEventListener('input', function() {
        this.closest('.stepper-group, .input-group-m3').classList.remove('error');
        updateVolumeColors();
    });
});

document.getElementById('targetDist').addEventListener('change', function() {
    const group = document.getElementById('targetDistGroup')?.querySelector('.input-group-m3');
    if (group) group.classList.remove('error');
    updateVolumeColors();
});

document.getElementById('raceDate').addEventListener('change', function() {
    const group = document.getElementById('raceDateGroup')?.querySelector('.input-group-m3');
    if (group) group.classList.remove('error');
});

document.getElementById('daysPerWeek').addEventListener('change', function() {
    const group = document.getElementById('daysGroup')?.querySelector('.input-group-m3');
    if (group) group.classList.remove('error');
    updateVolumeColors();
});

document.getElementById('raceType').addEventListener('change', function() {
    const group = document.getElementById('raceTypeGroup')?.querySelector('.input-group-m3');
    if (group) group.classList.remove('error');
});

// Nasłuchiwanie na selecty czasu, aby usunąć czerwoną ramkę z całego kontenera
['selHours', 'selMinutes', 'selSeconds'].forEach(id => {
    document.getElementById(id).addEventListener('change', function() {
        const timeContainer = document.getElementById('raceTimeContainer');
        if (timeContainer) timeContainer.classList.remove('error');
    });
});

/** Synchronizuje stan disabled przycisków +/- z polem readonly (run_index / adaptacja). */
function syncVolumeStepperButtons(volumeInput) {
    if (!volumeInput) return;
    const stepper = volumeInput.closest('.m3-stepper');
    if (!stepper) return;
    const locked = volumeInput.disabled;
    stepper.querySelectorAll('.stepper-btn').forEach((btn) => {
        btn.disabled = locked;
    });
}

// Funkcja do obsługi przycisków Steppera (+/-)
function adjustVolume(inputId, delta) {
    const input = document.getElementById(inputId);
    let currentVal = parseInt(input.value) || 0;
    let newVal = currentVal + delta;
    if (newVal < 0) newVal = 0; // Zabezpieczenie przed wartościami ujemnymi
    input.value = newVal;

    // Wyzwolenie zdarzenia 'input', aby system usunął ewentualne podświetlenie błędu (Inline Validation)
    input.dispatchEvent(new Event('input'));
}

// Trzystopniowy system oceny fizjologicznej poprawności objętości (czerwony/czarny/zielony).
// Event listenery zdefiniowane powyżej.
// Hybrydowa walidacja wizualna:
//   startVol → system trzystopniowy przez getStartVolumeStatus() (danger/neutral/optimal)
//   targetVol (input) → wyłącznie weryfikacja progresu: min. +5 km ponad startVol
function updateVolumeColors() {
    const distSelect = document.getElementById('targetDist');
    const startInput = document.getElementById('startVol');
    const targetVolInput = document.getElementById('targetVol');
    const daysSelect = document.getElementById('daysPerWeek');

    if (!distSelect || !startInput || !targetVolInput) return;

    const dist      = distSelect.value;
    const startVol  = parseInt(startInput.value) || 0;
    const targetVol = parseInt(targetVolInput.value)  || 0;

    // Odczyt danych przed requestAnimationFrame — zero layout thrashing
    requestAnimationFrame(() => {

        // ── 1. OBJĘTOŚĆ STARTOWA — system trzystopniowy wg fizjologii ──
        const startStatus = getStartVolumeStatus(dist, startVol);
        startInput.classList.remove('volume-optimal', 'volume-danger', 'volume-neutral', 'optimal-vol');
        startInput.classList.add(`volume-${startStatus}`);

        // ── 2. OBJĘTOŚĆ DOCELOWA — weryfikacja progresu (min. +5 km) ──
        // Zielony tylko gdy jest fizjologicznie uzasadniony progres;
        // czarny (neutral) w każdym innym przypadku — bez trybu danger.
        targetVolInput.classList.remove('volume-optimal', 'volume-danger', 'volume-neutral', 'optimal-vol');
        targetVolInput.classList.add(targetVol >= startVol + 5 ? 'volume-optimal' : 'volume-neutral');

        if (!dist || !daysSelect) return;

        // ── OZNACZANIE OPTYMALNEJ LICZBY DNI (logika gęstości km/dzień) ───
        const rules = {
            'k10': { minKmPerDay: 4, maxKmPerDay: 12 },
            'hm':  { minKmPerDay: 6, maxKmPerDay: 16 },
            'mar': { minKmPerDay: 8, maxKmPerDay: 30 }
        };
        const t = rules[dist];

        const recommendedDays = [];
        Array.from(daysSelect.options).forEach(option => {
            const optDays = parseInt(option.value);
            if (!optDays) return;
            const oStart = startVol  / optDays;
            const oPeak  = targetVol / optDays;
            const isOpt  = t && oStart >= t.minKmPerDay && oPeak <= t.maxKmPerDay
                           && startVol > 0 && targetVol > 0;
            if (isOpt) recommendedDays.push(optDays);
        });

        let isCurrentSelectionOptimal = false;

        Array.from(daysSelect.options).forEach(option => {
            const val = parseInt(option.value);
            const baseText = option.text.replace(' (Zalecane)', '');

            if (recommendedDays.includes(val)) {
                option.classList.add('option-optimal');
                option.text = baseText + ' (Zalecane)';
                if (option.selected) isCurrentSelectionOptimal = true;
            } else {
                option.classList.remove('option-optimal');
                option.text = baseText;
            }
        });

        daysSelect.classList.toggle('optimal-val', isCurrentSelectionOptimal);
    });
}

// D. Funkcja inicjalizująca i synchronizująca pola wyboru czasu (HH:MM:SS)
(function initAndSyncTimeSelectors() {
    const hSelect = document.getElementById('selHours');
    const mSelect = document.getElementById('selMinutes');
    const sSelect = document.getElementById('selSeconds');
    const hiddenInput = document.getElementById('raceTime');

    function populateSelect(element, max) {
        for (let i = 0; i < max; i++) {
            const opt = document.createElement('option');
            const val = i.toString().padStart(2, '0');
            opt.value = val;
            opt.innerText = val;
            if (i === 0) opt.selected = true; // Domyślnie zaznacz "00"
            element.appendChild(opt);
        }
    }

    populateSelect(hSelect, 25);
    populateSelect(mSelect, 60);
    populateSelect(sSelect, 60);

    function syncTime() {
        const timeString = `${hSelect.value}:${mSelect.value}:${sSelect.value}`;
        hiddenInput.value = timeString;
        hiddenInput.dispatchEvent(new Event('change'));
    }

    hSelect.addEventListener('change', syncTime);
    mSelect.addEventListener('change', syncTime);
    sSelect.addEventListener('change', syncTime);

    // Pierwsze, inicjalizacyjne uruchomienie
    syncTime();
})();

        // =======================================================
        // 3. GENERATOR SEZONU
        // =======================================================
        // =========================================================
        // WARSTWA KONFIGURACJI (SAFE MODE / AI LOGIC)
        // =========================================================
        const METHOD_CONFIG = {
            'balanced': {
                id: 'balanced',
                displayName: "Profil Zrównoważony",
                longRunCap: 32,
                desc: "Balans tlenowo-beztlenowy."
            },
            'volume': {
                id: 'volume',
                displayName: "Profil Objętościowy",
                longRunCap: 30,
                desc: "Dominacja 2. i 3. zakresu."
            },
            'cv_based': {
                id: 'cv_based',
                displayName: "Profil Płynny (CV)",
                longRunCap: 28,
                desc: "Critical Velocity - bez kwasu."
            }
        };
       // =========================================================
        // 4. BAZA TRENINGÓW (ZAKTUALIZOWANA O OBSŁUGĘ TEMPA R)
        // =========================================================
        
        const workoutsDB = {
            // --- WSPÓLNE ---
            "base_easy":   { km: 0,  name: "Bieg Spokojny", type: "E", desc: "Komfortowe tempo konwersacyjne (run_easy)." },
            
            // --- PROFIL ZRÓWNOWAŻONY (Domyślny) ---
            // TU ZMIANA: Opis Rytmów sugeruje teraz tempo, a nie czas
            "bal_speed_short": { km: 10, name: "Szybkość Techniczna", type: "R", desc: "3km BS + 10x 200m (Tempo: run_reps) p. 200m trucht + 3km BS" },
            "bal_speed_long":  { km: 12.5, name: "Interwały Tlenowe", type: "I", desc: "3km BS + 5x 1km (Tempo: run_vo2max) p. 3 min trucht + 3km BS" },
            "bal_tempo_run":   { km: 12, name: "Ciągły Progowy", type: "T", desc: "3km BS + 20 min ciągiem (Tempo: run_threshold) + 3km BS" },
            "bal_cruise":      { km: 15, name: "Powtórzenia Progowe", type: "T", desc: "3km BS + 4x 1.6km (Tempo: run_threshold) p. 1 min + 3km BS" },
            "bal_long_m":      { km: 18, name: "Bieg Długi z akcentem", type: "M", desc: "2km BS + 10-14km (Tempo: run_race_pace) + 2km BS" },

            // --- PROFIL OBJĘTOŚCIOWY (Dla Maratończyków) ---
            "vol_active":      { km: 14, name: "Bieg Aktywny (II Zakres)", type: "M", desc: "Bieg ciągły w strefie umiarkowanej (75-85% HRmax)." },
            "vol_terrain":     { km: 12, name: "Siła Biegowa (Kros)", type: "M", desc: "Bieg w terenie pofałdowanym. Mocno pod górę, luźno w dół." },
            "vol_submax":      { km: 16, name: "Wytrzymałość Tempowa", type: "T", desc: "3km BS + 3x 3km (Tempo: run_threshold) p. 4 min trucht + 2km BS" },

            // --- PROFIL PŁYNNY (CV) ---
            "cv_intervals":    { km: 11, name: "Interwały CV", type: "I", desc: "2km BS + 6x 1km (Tempo 10k) p. 90s trucht + 2km BS" },
            "cv_tempo":        { km: 12, name: "Bieg Progresywny", type: "T", desc: "8km narastającym tempem (od BS do run_threshold) + 1km schłodzenia" },

            // --- TRENINGI MIESZANE (COMPOUND — dynamicznie generowane) ---
            // isDynamic: true → createWeekWorkouts deleguje do generateAdvancedQualityWorkout()
            // zamiast używać statycznego pola desc.
            // Fizjologia COMPOUND_TR: połączenie progu mleczanowego (MLSS) z aktywacją
            // włókien IIx przez rytmy — podwójna adaptacja nerwowo-metaboliczna w jednej sesji.
            "bal_compound_tr": {
                km: 13, name: "Progowy + Rytmy", type: "C",
                isDynamic: true, workoutType: 'COMPOUND_TR'
            },

            // --- JEDNOSTKI SPECJALNE (ADVANCED SWITCH) ---
            "L_hard_M": { km: 24, name: "Long Run Specyficzny", type: "M", desc: "6km BS + 16km (Tempo: run_race_pace) + 2km BS" },
            "L_hard_T": { km: 22, name: "Long Run Jakościowy", type: "T", desc: "4km BS + 4x 3km (Tempo: run_threshold) p. 2 min + 4km BS" }
        };

        // STRATEGIA DOBORU TRENINGÓW (Mapping: Cel -> Faza -> Lista Treningów)
        // Klucze tutaj muszą odpowiadać kluczom w workoutsDB powyżej!
        const strategy = {
            "mar": { 
                "II":["bal_speed_short", "bal_cruise"], 
                "III":["bal_long_m", "bal_tempo_run", "bal_cruise"], 
                "IV":["bal_tempo_run"] 
            },
            "hm": { 
                "II":["bal_speed_short", "bal_speed_long"], 
                "III":["bal_speed_long", "bal_cruise", "bal_tempo_run"], 
                "IV":["bal_cruise"] 
            },
            "k10": {
                "II":["bal_speed_short"], 
                "III":["bal_speed_long", "cv_intervals", "bal_speed_short"], 
                "IV":["bal_speed_short"] 
            }
        };
// Słownik z opisami faz treningowych
        const phaseDescriptions = {
            "I": "Spokojne bieganie. Budujemy bazę tlenową i przyzwyczajamy mięśnie do wysiłku.",
            "II": "Wprowadzamy dynamiczne odcinki i poprawiamy technikę.",
            "III": "Najtrudniejsza faza z długimi biegami i treningami progowymi.",
            "IV": "Zmniejszamy objętość, łapiemy świeżość przed startem."
        };

        // Opisy mezocykli przeznaczone wyłącznie dla planów adaptacyjnych
        // (run_index 20–29), opartych na czasie — nie na kilometrażu.
        const adaptivePhaseDescriptions = {
            "I": "Adaptacja strukturalna. Priorytetem jest bezpieczne przyzwyczajenie aparatu ruchu do powtarzalnych obciążeń. Operujemy wyłącznie na czasie i pełnym komforcie, by zbudować trwały fundament bez ryzyka kontuzji.",
            "II": "Rozwój bazy tlenowej. Krok po kroku wydłużamy czas spędzany w ruchu. Wzmacniamy mięsień sercowy i uczymy organizm efektywnego korzystania z rezerw energetycznych.",
            "III": "Wytrzymałość docelowa. Najważniejszy etap przygotowań. Osiągamy bezpieczne maksimum czasu trwania długich biegów, co gwarantuje fizjologiczną gotowość do wyznaczonego dystansu.",
            "IV": "Tapering i superkompensacja. Drastycznie redukujemy objętość czasową. Zatrzymujemy proces stymulacji, aby organizm mógł w pełni wypłukać zmęczenie i odbudować tkanki przed dniem startu."
        };

        // =======================================================
        // DATA CONTRACT — SINGLE SOURCE OF TRUTH
        // Architektura: metadata → phases → weeks → days
        // Biologiczny punkt wyjścia: run_index określa intensywność
        // każdego mezocyklu; flaga isRecovery steruje redukcją stresu.
        // =======================================================

        /**
         * @typedef {Object} PlanDay
         * Reprezentuje pojedynczą jednostkę treningową (mikrocykl dzienny).
         *
         * @property {'rest'|'easy'|'quality'|'long'} type
         *   Klasyfikacja fizjologiczna dnia:
         *   - 'rest'    → brak bodźca (regeneracja pasywna)
         *   - 'easy'    → bieg spokojny, strefa tlenowa (run_easy)
         *   - 'quality' → bodziec jakościowy (run_threshold / run_vo2max / run_reps)
         *   - 'long'    → bieg długi, stymulacja mitochondrialna
         * @property {number} distance  Dystans w km (0 dla 'rest').
         * @property {string} description  Wygenerowany tekst treningu dla UI.
         */

        /**
         * @typedef {Object} PlanWeek
         * Reprezentuje mikrocykl tygodniowy.
         *
         * @property {number}   weekNumber  Numer tygodnia w całym planie (1-based).
         * @property {number}   targetVol   Zaplanowana objętość w km.
         * @property {boolean}  isRecovery
         *   Flaga fizjologiczna: true = tydzień regeneracyjny (–25% objętości).
         *   Organizm superkomensuje wyłącznie w oknie odbudowy — ta flaga
         *   zapewnia, że co 4. tydzień stres treningowy jest świadomie
         *   redukowany.
         * @property {PlanDay[]} days  Dokładnie 7 elementów (pon–nd).
         */

        /**
         * @typedef {Object} PlanPhase
         * Reprezentuje mezocykl (blok treningowy).
         *
         * @property {'I'|'II'|'III'|'IV'} id    Kod fazy (Cyfra Rzymska).
         * @property {string} name                Nazwa fazy (np. 'Fundament').
         * @property {string} description         Opis fizjologicznego celu fazy.
         * @property {PlanWeek[]} weeks           Mikrocykle należące do fazy.
         */

        /**
         * @typedef {Object} PlanMetadata
         * Biologiczny punkt wyjścia planu — dane wejściowe silnika generatora.
         *
         * @property {number}  runIndex       Wskaźnik Wydolności (run_index), np. 45.
         * @property {string}  raceDate       Data startu docelowego (ISO 8601, np. '2026-10-04').
         * @property {string}  targetDistance Kod dystansu: 'k10' | 'hm' | 'mar'.
         * @property {number}  startVolume    Objętość startowa (km/tydzień), np. 40.
         * @property {number}  peakVolume     Objętość szczytowa (km/tydzień), np. 80.
         * @property {number}  daysPerWeek    Liczba dni treningowych (3–7).
         * @property {boolean} isAdvancedMode Tryb zaawansowany — włącza Long Run specjalny.
         * @property {'balanced'|'volume'|'fluid'} method
         *   Profil treningowy:
         *   - 'balanced' → Profil Zrównoważony (precyzyjne cele tempa)
         *   - 'volume'   → Profil Objętościowy (skumulowane zmęczenie)
         *   - 'fluid'    → Profil Płynny CV (Tempo Krytyczne)
         */

        /**
         * @typedef {Object} TrainingPlan
         * Główny obiekt — Single Source of Truth dla wygenerowanego planu.
         *
         * @property {PlanMetadata} metadata  Dane wejściowe i kontekst biologiczny.
         * @property {PlanPhase[]}  phases    Mezocykle w kolejności chronologicznej.
         */

        /**
         * Factory Function — tworzy pusty szkielet TrainingPlan.
         * Wypełnienie tablicy `phases` należy do generateSeason().
         *
         * Fizjologia: funkcja przyjmuje surowe dane wejściowe od użytkownika
         * i pakuje je w ustrukturyzowany kontrakt, który silnik generatora
         * będzie sukcesywnie uzupełniał o mezocykle, mikrocykle i dni.
         *
         * @param {PlanMetadata} metadata
         * @returns {TrainingPlan}
         */
        function createPlanTemplate(metadata) {
            return {
                metadata: {
                    runIndex:       metadata.runIndex       ?? 45,
                    raceDate:       metadata.raceDate       ?? '',
                    targetDistance: metadata.targetDistance ?? 'mar',
                    startVolume:    metadata.startVolume    ?? 40,
                    peakVolume:     metadata.peakVolume     ?? 80,
                    daysPerWeek:    metadata.daysPerWeek    ?? 5,
                    isAdvancedMode: metadata.isAdvancedMode ?? false,
                    method:         metadata.method         ?? 'balanced'
                },
                phases: []   // wypełniane przez generateSeason()
            };
        }

        // --- LOGIKA PRZEŁĄCZNIKA TRYBU ---
        function toggleAdvancedMode() {
            const checkbox = document.getElementById('advancedMode');
            const label = document.getElementById('modeLabel');
            const desc = document.getElementById('modeDesc');
            const container = document.getElementById('modeContainer');
            
            // Zmieniamy stan checkboxa (jeśli kliknięto w kontener, a nie bezpośrednio w suwak)
            // Uwaga: natywne kliknięcie w input samo zmienia stan, więc sprawdzamy target
            // Ale dla uproszczenia w HTML daliśmy onclick na kontenerze.
            // Aby uniknąć podwójnego kliknięcia, po prostu odwracamy stan ręcznie:
            checkbox.checked = !checkbox.checked;

            // Logika tekstów
            if (checkbox.checked) {
                // STAN: ZAAWANSOWANY
                label.innerText = "Poziom: Zaawansowany";
                label.style.color = "#D32F2F"; // Opcjonalnie: kolor ostrzegawczy (czerwony)
                desc.innerText = "Wymagające jednostki i trudne wybiegania. Większe zmęczenie, ale maksymalna szansa na nową życiówkę.";
                container.style.backgroundColor = "#FFEBEE"; // Bardzo jasne czerwone tło (ostrzeżenie)
            } else {
                // STAN: ŚREDNIOZAAWANSOWANY
                label.innerText = "Poziom: Średniozaawansowany";
                label.style.color = "var(--md-sys-color-primary)"; // Powrót do niebieskiego
                desc.innerText = "Zbalansowany plan łączący bezpieczny rozwój z regeneracją. Idealny, by budować formę bez ryzyka przetrenowania.";
                container.style.backgroundColor = "var(--md-sys-color-surface-container)"; // Powrót do szarego
            }
        }
        
        // Dodatkowa poprawka: Jeśli użytkownik kliknie bezpośrednio w suwak, 
        // funkcja onclick kontenera też się wywoła (bubbling).
        // Żeby to naprawić, musimy dodać listener bezpośrednio na input, żeby nie psuł logiki,
        // LUB najprościej: w HTML usuń onclick="..." z inputa, a zostaw tylko na divie.
        // W powyższym HTML (Krok 2) input NIE MA onclick, więc jest OK.
        // Jedynie musimy zablokować kliknięcie w sam LABEL switcha, żeby nie duplikowało zdarzeń.
        // W CSS dla .switch dodaj: pointer-events: none; a dla inputa pointer-events: none;


        // =======================================================
        // ORKIESTRATOR — Główny Kontroler Przepływu
        // Wzorzec: Extract → Validate → Calculate → Render
        // =======================================================

        /**
         * Główny punkt wejścia dla przycisku "Generuj Plan Treningowy".
         *
         * Odpowiada za:
         * 1. Ekstrakcję danych z DOM do czystego obiektu `userParams`.
         * 2. Walidację fizjologiczną i biznesową (Guardrails).
         * 3. Wywołanie silnika obliczeniowego: calculateTrainingLoad().
         * 4. Przekazanie wyniku do warstwy widoku: renderPlan().
         *
         * Każdy błąd fizjologiczny lub brakujące dane przerywają
         * pipeline i wyświetlają użytkownikowi zrozumiały komunikat.
         */
        function generateSeasonController() {
            try {

                // ── KROK A: Ekstrakcja danych z DOM ──────────────────────
                const raceDateRaw    = document.getElementById('raceDate').value;
                const targetDistance = document.getElementById('targetDist').value;
                const startVolume    = parseFloat(document.getElementById('startVol').value);
                const peakVolume     = parseFloat(document.getElementById('targetVol').value);
                const daysPerWeek    = parseInt(document.getElementById('daysPerWeek').value, 10);
                const isAdvancedMode = document.getElementById('advancedMode').checked;

                // Bezpieczne mapowanie metody — wyłącznie dozwolone wartości
                const methodInput    = document.querySelector('input[name="trainingMethod"]:checked');
                const allowedMethods = ['balanced', 'volume', 'fluid'];
                const method         = allowedMethods.includes(methodInput?.value)
                                           ? methodInput.value
                                           : 'balanced';

                // ── KROK B: Walidacja fizjologiczna i biznesowa (Error Aggregator) ─
                let hasErrors = false;
                const errorMessages = [];

                const raceTypeGroupEl   = document.getElementById('raceTypeGroup')?.querySelector('.input-group-m3');
                const raceTimeContainer = document.getElementById('raceTimeContainer');
                const targetDistGroupEl = document.getElementById('targetDistGroup')?.querySelector('.input-group-m3');
                const raceDateGroupEl   = document.getElementById('raceDateGroup')?.querySelector('.input-group-m3');
                const startGroup        = document.getElementById('startVolGroup');
                const peakGroup         = document.getElementById('peakVolGroup');
                const daysGroupEl       = document.getElementById('daysGroup')?.querySelector('.input-group-m3');

                // 0. Kalibracja formy - Dystans Testu
                const raceTypeVal = document.getElementById('raceType').value;
                if (!raceTypeVal) {
                    if (raceTypeGroupEl) raceTypeGroupEl.classList.add('error');
                    hasErrors = true;
                } else {
                    if (raceTypeGroupEl) raceTypeGroupEl.classList.remove('error');
                }

                // 0a. Kalibracja formy - Czas Testu
                const hVal = document.getElementById('selHours').value;
                const mVal = document.getElementById('selMinutes').value;
                const sVal = document.getElementById('selSeconds').value;
                const totalSecs = (parseInt(hVal) * 3600) + (parseInt(mVal) * 60) + parseInt(sVal);

                // Sprawdzamy czy czas wynosi 00:00:00 ORAZ czy runIndex nie został policzony
                if (totalSecs === 0 || !userRunIndex || userRunIndex <= 0) {
                    if (raceTimeContainer) raceTimeContainer.classList.add('error');
                    hasErrors = true;
                } else {
                    if (raceTimeContainer) raceTimeContainer.classList.remove('error');
                }

                // 1. Dystans docelowy
                if (!targetDistance || targetDistance === "") {
                    if (targetDistGroupEl) targetDistGroupEl.classList.add('error');
                    hasErrors = true;
                } else {
                    if (targetDistGroupEl) targetDistGroupEl.classList.remove('error');
                }

                // 2. Data startu docelowego
                // Walidujemy brak daty TYLKO wtedy, gdy użytkownik wyłączył tryb Auto.
                // Jeśli tryb Auto jest włączony, pole uzupełni się po wybraniu dystansu
                // (ewentualny błąd wyłapie walidator dystansu).
                const autoDateSwitch = document.getElementById('autoDateSwitch');
                if (autoDateSwitch && !autoDateSwitch.checked && !raceDateRaw) {
                    if (raceDateGroupEl) raceDateGroupEl.classList.add('error');
                    hasErrors = true;
                } else {
                    if (raceDateGroupEl) raceDateGroupEl.classList.remove('error');
                }

                // 3. Objętość (start / peak)
                if (startVolume <= 0 || isNaN(startVolume)) {
                    if (startGroup) startGroup.classList.add('error');
                    hasErrors = true;
                } else {
                    if (startGroup) startGroup.classList.remove('error');
                }
                if (peakVolume <= 0 || isNaN(peakVolume) || peakVolume < startVolume + 5) {
                    if (peakGroup) peakGroup.classList.add('error');
                    hasErrors = true;
                    // Specyficzny komunikat dla tej reguły — nadpisuje generyczny throw poniżej
                    throw new Error(
                        'Cel treningowy (Maksymalny kilometraż) musi być większy o co najmniej 5 km ' +
                        'od obecnego kilometrażu, aby wygenerować bezpieczną progresję!'
                    );
                } else {
                    if (peakGroup) peakGroup.classList.remove('error');
                }

                // 4. Dni treningowe
                if (isNaN(daysPerWeek)) {
                    if (daysGroupEl) daysGroupEl.classList.add('error');
                    hasErrors = true;
                } else {
                    if (daysGroupEl) daysGroupEl.classList.remove('error');
                }

                if (hasErrors) {
                    throw new Error("Formularz zawiera braki. Uzupełnij parametry podświetlone na czerwono.");
                }

                // ── KROK C: Budowa obiektu parametrów (PlanMetadata) ─────
                const userParams = {
                    runIndex:       userRunIndex,
                    raceDate:       raceDateRaw,
                    targetDistance: targetDistance,
                    startVolume:    startVolume,
                    peakVolume:     peakVolume,
                    daysPerWeek:    daysPerWeek,
                    isAdvancedMode: isAdvancedMode,
                    method:         method
                };

                // ── KROK D: Router Silników ───────────────────────────────
                //
                // Fizjologia → Routing:
                //   "Widełki adaptacyjne" = biegacz z bazą tlenową, ale jeszcze
                //   niewystarczającą do pełnego planu periodyzowanego.
                //   k10: run_index 20–29  →  silnik adaptacyjny
                //   hm:  run_index 25–29  →  silnik adaptacyjny
                //   run_index >= 30       →  pełny silnik periodyzacji
                //
                // Przypadki zbyt niskiego wskaźnika obsłużone wcześniej w B2a
                // (renderExpertAdvice + return), więc tutaj nie pojawiają się.
                const isAdaptiveRange =
                    (targetDistance === 'k10' && userRunIndex >= 20 && userRunIndex < 30) ||
                    (targetDistance === 'hm'  && userRunIndex >= 25 && userRunIndex < 30);

                let planData;
                if (isAdaptiveRange) {
                    // Silnik Adaptacyjny — plan progresywny dla rozwijających się biegaczy
                    planData = calculateAdaptivePlan(userParams);
                } else {
                    // Pełny Silnik Periodyzacji — makrocykl 4-fazowy (run_index ≥ 30)
                    planData = calculateTrainingLoad(userParams);
                }
                renderPlan(planData);

            } catch (error) {
                // Błędy walidacji i obliczeniowe wyświetlamy użytkownikowi.
                showSnackbar(error.message);
            }
        }

        // =======================================================
        // =======================================================
        // STUB: Silnik Adaptacyjny (do implementacji w Kroku 2)
        // Docelowo: plan progresywny dla run_index 20–29
        // =======================================================

        /**
         * Silnik Adaptacyjny — plan dla biegaczy w "widełkach adaptacyjnych".
         *
         * Fizjologia (Biology to Math):
         * - run_index 20–29 = baza tlenowa zbudowana, ale brak gotowości
         *   na pełną periodyzację 4-fazową. Plan skupia się na progresywnym
         *   budowaniu objętości i pierwszych akcentach progowych.
         * - Zwraca strukturę TrainingPlan (ten sam Kontrakt Danych),
         *   dzięki czemu renderPlan() działa bez modyfikacji.
         *
         * @param {PlanMetadata} params
         * @returns {TrainingPlan}
         */
        /**
         * Silnik Adaptacyjny — plan dla run_index 20–29.
         *
         * Fizjologia (Biology to Math):
         * - Ignoruje startVolume / peakVolume — operuje na minutach biegu,
         *   nie kilometrach. Dla run_index 20–29 próba narzucenia km/tydzień
         *   jest fizjologicznie nieuzasadniona (brak bazy do wyliczenia tempa).
         * - Tempo bazowe: ~8 min/km (Strefa 1–2, rozmowa możliwa).
         * - Długi bieg rośnie o 5 min każdy tydzień budujący (progresja liniowa).
         * - Co 4. tydzień: isRecovery = true → –25% czasu (superkompensacja).
         * - Faza I: wyłącznie biegi spokojne (adaptacja neuromięśniowa).
         * - Faza II: pierwsze lekkie akcenty tempowe przy ≥ 3 dniach/tyg.
         *
         * @param {PlanMetadata} params
         * @returns {TrainingPlan}
         */
        function calculateAdaptivePlan(params) {

            // ── 1. Inicjalizacja, czas i tempa ────────────────────────
            const plan      = createPlanTemplate(params);
            const today     = new Date();
            const raceDate  = new Date(params.raceDate);
            const msPerWeek = 1000 * 60 * 60 * 24 * 7;
            const totalWeeks = Math.max(4, Math.floor((raceDate - today) / msPerWeek));

            // Lookup tempa z tabeli referencyjnej.
            // run_index 20–29 nie ma wpisów w pacesTable (która startuje od 30),
            // dlatego fallback na pacesTable[30] — najwolniejszy wzorzec tempa w tabeli.
            const pVals = pacesTable[params.runIndex] || pacesTable[30];

            // ── 2. Podział na fazy (4 Mezocykle) ───────────────────────
            // Tapering (Faza IV) — dla biegaczy adaptacyjnych 2 tyg. wystarczą,
            // by wypłukać zmęczenie bez utraty formy.
            let wIV = Math.min(2, Math.floor(totalWeeks * 0.2));
            if (wIV < 1) wIV = 1;

            let remaining = totalWeeks - wIV;

            // Faza III (Wytrzymałość docelowa) — ~30% pozostałego czasu;
            // tutaj Long Run osiąga swoje maksimum (MAX_LONG z config).
            let wIII = Math.max(2, Math.floor(remaining * 0.3));
            remaining -= wIII;

            // Faza I (Adaptacja) i Faza II (Baza) dzielą resztę po równo.
            let wI  = Math.ceil(remaining * 0.5);
            let wII = remaining - wI;

            // Zabezpieczenia brzegowe dla bardzo krótkich planów (np. 8 tygodni)
            if (wI < 1) { wI = 1; wII = Math.max(1, remaining - 1); }

            // ── 3. Stałe czasu treningu (Top-Down Approach) ──
            const PACE_FOR_KM = 8; // min/km do szacowania dystansu [km]

            // baseWeekMin: startowy czas CAŁEGO tygodnia [min]
            // maxWeekMin:  szczytowy czas CAŁEGO tygodnia [min]
            // maxLong:     twardy limit najdłuższego biegu — Clamp bezpieczeństwa [min]
            const adaptiveThresholds = {
                'k10': { baseWeekMin: 90,  maxWeekMin: 160, maxLong: 75  },
                'hm':  { baseWeekMin: 120, maxWeekMin: 240, maxLong: 120 }
            };

            const config = adaptiveThresholds[params.targetDistance] || adaptiveThresholds['k10'];

            // min → km (szacunek dla nagłówka tygodnia)
            const toKm = m => parseFloat((m / PACE_FOR_KM).toFixed(1));

            // ── 4. Wzorce dni tygodnia — 48h przerwy między sesjami ──
            //   2 dni: Pt (4), Nd (6)           → 2-dniowa przerwa przed ndz.
            //   3 dni: Wt (1), Czw (3), Nd (6)  → klasyczny schemat 48h
            //   4 dni: Pn (0), Śr (2), Pt (4), Nd (6)
            const DAY_SLOTS = {
                2: { active: [4, 6],       qualitySlot: null },
                3: { active: [1, 3, 6],    qualitySlot: 3    }, // Czwartek = akcent
                4: { active: [0, 2, 4, 6], qualitySlot: 2    }  // Środa = akcent
            };

            /**
             * Mini-fabryka dzienna — buduje tablicę 7 obiektów PlanDay.
             * Niedziela (index 6) = zawsze najdłuższy bieg tygodnia.
             *
             * @param {number}  longMin        Czas długiego biegu [min]
             * @param {number}  easyMin        Czas biegu spokojnego [min]
             * @param {boolean} includeQuality Faza II: wstawiamy akcent tempowy
             */
            const buildAdaptiveDays = (longMin, easyMin, includeQuality) => {
                const days  = [];
                const dpw   = Math.min(4, Math.max(2, params.daysPerWeek));
                const cfg   = DAY_SLOTS[dpw] || DAY_SLOTS[3];
                const { active, qualitySlot } = cfg;

                for (let i = 0; i < 7; i++) {
                    if (!active.includes(i)) {
                        days.push({ type: 'rest', text: 'Wolne', dist: 0 });
                        continue;
                    }

                    // Niedziela — Adaptacyjny Long Run (czas rośnie co tydzień)
                    if (i === 6) {
                        days.push({
                            type: 'long',
                            text: `Bieg ciągły: ${longMin} min (Tempo: ${pVals.run_easy})`,
                            dist: toKm(longMin)
                        });
                        continue;
                    }

                    // Slot akcentu (Czw lub Śr, zależnie od liczby dni) — tylko Faza II
                    if (includeQuality && i === qualitySlot) {
                        const tempoMin = Math.round(easyMin * 0.85);
                        days.push({
                            type: 'quality',
                            text: `Bieg Tempowy: ${tempoMin} min (Tempo: ${pVals.run_threshold})`,
                            dist: toKm(tempoMin)
                        });
                        continue;
                    }

                    // Pozostałe aktywne dni — biegi spokojne z podanym tempem
                    days.push({
                        type: 'easy',
                        text: `Bieg ciągły: ${easyMin} min (Tempo: ${pVals.run_easy})`,
                        dist: toKm(easyMin)
                    });
                }
                return days;
            };

            // ── 5. Budowniczy mezocyklu ────────────────────────────────
            let weekCounter = 1;

            const buildPhase = (count, id, name, phaseOffset, withQuality) => {
                const phase = {
                    id,
                    name,
                    description: adaptivePhaseDescriptions[id] || '',
                    weeks: []
                };

                for (let i = 0; i < count; i++) {

                    // ── A. Całkowita objętość tygodnia (Top-Down) ─────────────
                    const isRecovery = (weekCounter % 4 === 0) && (id !== 'IV');

                    // Liniowa progresja od baseWeekMin do maxWeekMin
                    // przez wszystkie tygodnie budujące (Fazy I–III).
                    const totalBuildWeeks  = wI + wII + wIII;
                    const currentBuildWeek = Math.min(phaseOffset + i, totalBuildWeeks - 1);
                    const progressRatio    = totalBuildWeeks > 1
                        ? currentBuildWeek / (totalBuildWeeks - 1)
                        : 1;

                    let rawWeekMin = config.baseWeekMin
                        + progressRatio * (config.maxWeekMin - config.baseWeekMin);

                    if (isRecovery) rawWeekMin *= 0.75; // superkompensacja co 4. tydzień
                    if (id === 'IV') rawWeekMin *= 0.5; // tapering: −50% objętości

                    // ── B. Przydział na Bieg Długi (Long Run) ─────────────────
                    // Fizjologia: Long Run nie może stanowić więcej niż 45% tygodnia,
                    // bo nadmierna dominacja jednej sesji niszczy rytm regeneracji.
                    let longMin = Math.round(rawWeekMin * 0.45);
                    if (longMin > config.maxLong) longMin = config.maxLong;

                    // ── C. Redystrybucja na biegi spokojne (Easy Runs) ────────
                    const dpw        = Math.min(4, Math.max(2, params.daysPerWeek));
                    const easyDaysCount = dpw - 1; // wszystkie dni poza niedzielą (Long)

                    let easyMin = Math.round((rawWeekMin - longMin) / easyDaysCount);
                    if (easyMin < 20) easyMin = 20; // min. bodziec tlenowy

                    const useQuality = withQuality && !isRecovery && params.daysPerWeek >= 3;

                    const adaptiveDays = buildAdaptiveDays(longMin, easyMin, useQuality);

                    // Bottom-Up: rzeczywista suma dystansów z kafelków
                    const actualWeekDist = adaptiveDays.reduce(
                        (sum, day) => sum + parseFloat(day.dist || 0), 0
                    );

                    phase.weeks.push({
                        weekNumber: weekCounter,
                        targetVol:  parseFloat(actualWeekDist.toFixed(1)),
                        isRecovery,
                        days: adaptiveDays
                    });
                    weekCounter++;
                }
                return phase;
            };

            // ── FAZA I: Adaptacja Strukturalna ────────────────────────
            plan.phases.push(buildPhase(wI,   'I',   'Adaptacja',    0,                false));

            // ── FAZA II: Budowa Bazy Tlenowej ─────────────────────────
            plan.phases.push(buildPhase(wII,  'II',  'Baza Tlenowa', wI,               true));

            // ── FAZA III: Wytrzymałość Docelowa ───────────────────────
            plan.phases.push(buildPhase(wIII, 'III', 'Wytrzymałość', wI + wII,         true));

            // ── FAZA IV: Tapering i Superkompensacja ──────────────────
            // Long Run zmniejszamy przez isRecovery w buildPhase; brak akcentów.
            plan.phases.push(buildPhase(wIV,  'IV',  'Tapering',     wI + wII + wIII - 1, false));

            return plan;
        }

        // =======================================================
        // Silnik Obliczeniowy (Pełna Periodyzacja)
        // =======================================================

        /**
         * Silnik Obliczeniowy — przekształca PlanMetadata w pełny TrainingPlan.
         *
         * Fizjologia (Biology to Math):
         * - Makrocykl = 4 mezocykle: Fundament → Szybkość → Wytrzymałość → Tapering.
         * - Zasada progresywnego przeciążenia: objętość rośnie o volStep przez
         *   tygodnie budujące; organizm adaptuje się stopniowo, bez ryzyka kontuzji.
         * - Superkompensacja: co 4. tydzień isRecovery = true → redukcja bodźca
         *   o 25%; to właśnie w oknie regeneracji dochodzi do wzrostu wydolności.
         * - Tapering (Faza IV): agresywne cięcie km (70%→50%→35%→ministart)
         *   wypłukuje zmęczenie kumulacyjne, zachowując gotowość startową.
         *
         * Guardrails: ZERO operacji DOM. Czysta funkcja obiektowa.
         *
         * @param {PlanMetadata} params
         * @returns {TrainingPlan}
         */
        function calculateTrainingLoad(params) {

            // ── KROK 1: Inicjalizacja planu i obliczenia czasu ────────────
            // createPlanTemplate jako pierwsze wywołanie — zgodnie z Kontraktem Danych.
            const plan = createPlanTemplate(params);

            const today      = new Date();
            const raceDate   = new Date(params.raceDate);
            const msPerWeek  = 1000 * 60 * 60 * 24 * 7;
            const totalWeeks = Math.floor((raceDate - today) / msPerWeek);

            // ── KROK 2: Dystrybucja mezocykli ─────────────────────────────
            // Faza IV (Tapering) — stałe 4 tygodnie.
            // Faza III — min. 4 tygodnie, połowa pozostałego czasu.
            // Fazy I i II — reszta, podzielona po połowie (ceil/floor).
            let wIV = 4;
            let wIII = Math.max(4, Math.floor((totalWeeks - wIV) / 2));
            let remaining = totalWeeks - wIV - wIII;
            let wII = Math.ceil(remaining / 2);
            let wI  = remaining - wII;
            // Zabezpieczenie przed wartościami ujemnymi
            if (wI  < 0) { wI = 0; wII = remaining; }
            if (wII < 0) { wII = 0; wIII = totalWeeks - wIV; }

            // ── KROK 3: Progresja objętości (volStep) ──────────────────────
            // Tygodnie regeneracyjne (co 4.) nie zwiększają obciążenia —
            // odejmujemy je od puli budujących przy wyliczeniu kroku.
            let currentVol = params.startVolume;
            const buildWeeks = (wI + wII) - Math.floor((wI + wII) / 4);
            const volStep    = (params.peakVolume - params.startVolume)
                               / Math.max(1, buildWeeks);
            let weekCounter = 1; // globalny licznik dla całego makrocyklu

            // ── KROK 4–6: Pomocnicza funkcja budująca mezocykl ────────────
            /**
             * Buduje obiekt PlanPhase i wypycha go do plan.phases.
             * Zamknięcie (closure) nad: plan, currentVol, weekCounter,
             * volStep, params — nie wymaga argumentów kontekstu.
             *
             * @param {number} count  Liczba tygodni w fazie
             * @param {string} name   Nazwa wyświetlana fazy
             * @param {'I'|'II'|'III'|'IV'} code  Kod fazy
             */
            function buildPhaseObject(count, name, code) {
                if (count <= 0) return; // pomiń fazę bez tygodni

                // Obiekt Phase zgodny z interfejsem PlanPhase
                const phase = {
                    id:          code,
                    name:        name,
                    description: phaseDescriptions[code] || '',
                    weeks:       []
                };

                for (let i = 0; i < count; i++) {

                    // ── A. Flaga superkompensacji (co 4. tydzień makrocyklu) ──
                    // Fizjologia: organizm nadbudowuje wydolność podczas regeneracji,
                    // nie podczas samego treningu. Faza IV jest z logiki wyłączona
                    // (jej redukcja jest sterowana osobno przez model Taperingowy).
                    const isRecovery = (weekCounter % 4 === 0) && (code !== 'IV');

                    // ── B. Obliczenie objętości docelowej tygodnia ────────────
                    let targetVol;

                    if (code === 'IV') {
                        // Tapering: każdy tydzień ma z góry ustaloną redukcję.
                        // Kluczowe dla adaptacji startowej — chroni przed
                        // nakumulowanym zmęczeniem mięśniowym w dniu startu.
                        const weeksLeft = count - i;
                        if      (weeksLeft === 4) targetVol = params.peakVolume * 0.70;
                        else if (weeksLeft === 3) targetVol = params.peakVolume * 0.50;
                        else if (weeksLeft === 2) targetVol = params.peakVolume * 0.35;
                        else                       targetVol = 20; // ministart — aktywacja nerwowa
                    } else if (isRecovery) {
                        // Tydzień regeneracyjny: –25% bez zmiany pułapu currentVol.
                        // currentVol nie rośnie — punkt startowy następnego cyklu
                        // pozostaje ten sam, co daje efekt "schodkowy".
                        targetVol = currentVol * 0.75;
                    } else {
                        // Tydzień budujący: linearna progresja objętości.
                        currentVol = Math.min(params.peakVolume, currentVol + volStep);
                        targetVol  = currentVol;
                    }

                    // ── C. Delegacja do Fabryki Mikrocyklu ───────────────────
                    // Przekazujemy params bezpośrednio, rozszerzając go o
                    // flagi kontekstowe (isLastWeek, isAdvanced — alias dla
                    // isAdvancedMode, którego oczekuje createWeekWorkouts).
                    const isLastWeek = (code === 'IV') && (i === count - 1);

                    const days = createWeekWorkouts(
                        code,               // phaseCode
                        i,                  // weekIndex (0-based, rotacja treningów)
                        Math.round(targetVol),
                        {
                            ...params,
                            isAdvanced: params.isAdvancedMode, // alias dla Fabryki
                            isLastWeek
                        }
                    );

                    // ── D. Buduj obiekt PlanWeek i dodaj do fazy ─────────────
                    // Bottom-Up: sumujemy rzeczywiste dystanse z kafelków zamiast
                    // używać zaokrąglonej wartości planowanej. Eliminuje rozbieżności
                    // wynikające z zaokrągleń w createWeekWorkouts i toFixed().
                    const actualWeekDist = days.reduce(
                        (sum, day) => sum + parseFloat(day.dist || 0), 0
                    );

                    phase.weeks.push({
                        weekNumber: weekCounter,
                        targetVol:  parseFloat(actualWeekDist.toFixed(1)),
                        isRecovery: isRecovery,
                        days:       days
                    });

                    weekCounter++;
                }

                plan.phases.push(phase);
            }

            // ── KROK 6: Wywołanie budowniczego dla każdej fazy ────────────
            buildPhaseObject(wI,   'Fundament',    'I');
            buildPhaseObject(wII,  'Szybkość',     'II');
            buildPhaseObject(wIII, 'Wytrzymałość', 'III');
            buildPhaseObject(wIV,  'Tapering',     'IV');

            return plan;
        }

        // =======================================================
        // WARSTWA RENDEROWANIA — renderPlan(plan)
        // Czysta funkcja DOM: wejście = TrainingPlan (JSON),
        // wyjście = gotowe karty Material Design 3 w #seasonView.
        //
        // Guardrail: ZERO obliczeń. Tylko czytanie danych i budowanie HTML.
        // Fizjologia → UI:
        //   type-quality (czerwień) = bodziec nerwowo-mięśniowy (akcenty)
        //   type-long   (pomarańcz) = stymulacja mitochondriów (długie biegi)
        //   type-easy   (niebieski) = baza tlenowa (biegi spokojne)
        //   isRecovery  (szary nagłówek) = okno superkompensacji
        // =======================================================

        /**
         * Przyjmuje gotowy TrainingPlan i wstrzykuje HTML do #seasonView.
         * Separacja renderowania od logiki obliczeniowej umożliwia
         * podmianę widoku (np. eksport PDF) bez zmiany Silnika.
         *
         * @param {TrainingPlan} plan
         */
        /**
         * Renderuje kartę "Diagnoza trenerska" w #seasonView gdy użytkownik
         * nie spełnia minimalnego progu wydolności dla wybranego dystansu.
         * Pure Function — tylko operacje DOM na #seasonView, zero zmian stanu globalnego.
         *
         * @param {string} targetDistKey  Klucz dystansu, np. 'hm', 'mar'
         * @param {number} currentIndex   Aktualny run_index użytkownika
         * @param {number} requiredIndex  Wymagane minimum dla dystansu
         */
        function renderExpertAdvice(targetDistKey, currentIndex, requiredIndex) {
            const container = document.getElementById('seasonView');
            container.innerHTML = '';

            const distNames = { 'k10': '10 km', 'hm': 'Półmaraton', 'mar': 'Maraton' };

            const card = document.createElement('article');
            card.className = 'expert-advice-card';
            card.setAttribute('role', 'status');
            card.setAttribute('aria-label', 'Diagnoza trenerska — rekomendacja dystansu');
            card.innerHTML = `
                <div class="expert-icon-circle" role="img" aria-label="Ikona zdrowia i bezpieczeństwa">
                    <span class="material-symbols-outlined">health_and_safety</span>
                </div>
                <h2>Diagnoza trenerska</h2>
                <p>
                    Twója obecna wydolność to świetny punkt wyjścia, ale z fizjologicznego punktu widzenia, Twoje ciało potrzebuje najpierw
                    zbudować silniejszą bazę tlenową. Trening docelowy pod
                    <strong>${distNames[targetDistKey] ?? targetDistKey}</strong> na tym etapie to
                    ogromne obciążenie dla układu ruchu i krążenia. Zależy nam na Twoim zdrowiu. Rozważ na ten moment zmianę
                    celu na krótszy dystans.
                </p>
            `;
            container.appendChild(card);
        }

        /**
         * Renderuje Złotą Kartę dla Elity (run_index > 70) w głównym oknie.
         * Używa tej samej struktury co expert-advice-card, ale z kolorystyką Premium.
         */
        function renderEliteAdvice(targetDistKey) {
            const container = document.getElementById('seasonView');
            container.innerHTML = '';

            const card = document.createElement('article');
            card.className = 'expert-advice-card';
            card.setAttribute('role', 'status');
            card.setAttribute('aria-label', 'Komunikat dla elity sportowej');

            card.style.backgroundColor = '#fffbea';
            card.style.color           = '#7a5c00';
            card.style.border          = '1px solid #fde68a';

            card.innerHTML = `
                <div class="expert-icon-circle" style="margin-bottom: 16px;">
                    <span class="material-symbols-outlined" style="color: #B8860B; font-size: 36px; display: block; line-height: 1; margin: 0;">workspace_premium</span>
                </div>
                <h2 style="color: #B8860B; font-size: 1.4rem; font-weight: 700; margin: 0 0 16px;">Poziom Elity Sportowej</h2>
                <p style="font-size: 1rem; line-height: 1.65; margin: 0; max-width: 520px;">
                    ${eliteMessages[targetDistKey] || eliteMessages['k10']}
                </p>
            `;
            container.appendChild(card);
        }

        /**
         * Przywraca domyślny stan pustego widoku głównego.
         * Resetuje TYLKO wtedy, gdy w widoku wisi karta diagnozy lub elity,
         * aby nie kasować wygenerowanego planu treningowego.
         */
        function resetSeasonView() {
            const container = document.getElementById('seasonView');
            if (container.querySelector('.expert-advice-card')) {
                container.innerHTML = `
                    <div style="text-align:center; padding:50px; color:var(--muted); border: 2px dashed var(--border); border-radius: 10px; background: white;">
                        Wprowadź parametry w panelu po lewej i kliknij GENERUJ PLAN.
                    </div>
                `;
            }
        }

        function renderPlan(plan) {
            const container = document.getElementById('seasonView');
            container.innerHTML = '';

            // DocumentFragment — bufor in-memory eliminujący Layout Thrashing.
            // Wszystkie appendChild() operują na odłączonym poddrzewie; przeglądarka
            // nie wyzwala reflow/repaint aż do jednorazowego zapisu na końcu funkcji.
            const fragment = document.createDocumentFragment();

            const meta     = plan.metadata;
            const today    = new Date();
            const DAY_NAMES = ['PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB', 'ND'];

            // Semantyczne etykiety ARIA opisujące fizjologiczny cel dnia
            const TYPE_ARIA = {
                rest:    'Dzień odpoczynku — regeneracja bierna',
                easy:    'Bieg spokojny — budowa bazy tlenowej',
                long:    'Bieg długi — stymulacja mitochondriów i kapilaryzacja',
                quality: 'Akcent treningowy — bodziec nerwowo-mięśniowy'
            };

            // ── BANER PODSUMOWANIA PLANU ──────────────────────────────────
            const totalWeeks = plan.phases.reduce((sum, p) => sum + p.weeks.length, 0);
            const distLabel  = { k10: '10 km', hm: 'Półmaraton', mar: 'Maraton' }[meta.targetDistance]
                               || meta.targetDistance.toUpperCase();
            const methodLabel = {
                balanced: 'Profil Zrównoważony',
                volume:   'Profil Objętościowy',
                fluid:    'Profil Płynny',
                fatigue:  'Profil Skumulowanego Zmęczenia'
            }[meta.method] || meta.method;

            const summaryEl = document.createElement('div');
            summaryEl.className = 'plan-summary-header';
            summaryEl.setAttribute('role', 'region');
            summaryEl.setAttribute('aria-label', 'Podsumowanie planu treningowego');
            summaryEl.innerHTML = `
                <div class="plan-summary-inner">
                    <div class="plan-summary-item">
                        <span class="plan-summary-label">Dystans docelowy</span>
                        <span class="plan-summary-value">${distLabel}</span>
                    </div>
                    <div class="plan-summary-item">
                        <span class="plan-summary-label">Wskaźnik Wydolności</span>
                        <span class="plan-summary-value">${meta.runIndex}</span>
                    </div>
                    <div class="plan-summary-item">
                        <span class="plan-summary-label">Metoda</span>
                        <span class="plan-summary-value">${methodLabel}</span>
                    </div>
                    <div class="plan-summary-item">
                        <span class="plan-summary-label">Łączne tygodnie</span>
                        <span class="plan-summary-value">${totalWeeks}</span>
                    </div>
                    <div class="plan-summary-item">
                        <span class="plan-summary-label">Dni / tydzień</span>
                        <span class="plan-summary-value">${meta.daysPerWeek}</span>
                    </div>
                </div>
            `;
            fragment.appendChild(summaryEl);

            // ── FAZY → TYGODNIE → DNI ─────────────────────────────────────
            plan.phases.forEach(phase => {
                // Nagłówek fazy + opis fizjologiczny
                const phaseEl = document.createElement('section');
                phaseEl.className = 'phase-block';
                phaseEl.innerHTML = `
                    <h2 class="phase-header phase-${phase.id}">
                        FAZA ${phase.id}: ${phase.name} (${phase.weeks.length} tyg.)
                    </h2>
                    <p class="phase-description">${phase.description}</p>
                `;
                fragment.appendChild(phaseEl);

                phase.weeks.forEach(week => {
                    // Data poniedziałku danego tygodnia
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() + (week.weekNumber - 1) * 7);

                    const recoveryBadge = week.isRecovery
                        ? `<span class="recovery-tag" aria-label="Tydzień regeneracyjny — okno superkompensacji">REGENERACJA</span>`
                        : '';

                    // Komórki 7 dni — kolor pigułki wynika z day.type
                    const daysHTML = week.days.map((day, idx) => {
                        const distBadge = day.dist > 0
                            ? `<span class="day-dist" aria-label="${day.dist} km">${day.dist} km</span>`
                            : '';

                        // ── Budowa wnętrza pigułki ────────────────────────────
                        // Ścieżka strukturalna: day.steps (Array) → <ul class="workout-steps">
                        // Ścieżka klasyczna:    brak steps          → day.text (String)
                        let pillInner;
                        if (Array.isArray(day.steps)) {
                            // Tytuł to pierwsza część day.text (przed ': '), np. "Progowy + Rytmy"
                            const pillTitle = day.text.includes(': ')
                                ? day.text.split(': ')[0]
                                : day.text;
                            const stepsHTML = day.steps
                                .map(s => `<li>${s}</li>`)
                                .join('');
                            pillInner = `<span class="pill-title">${pillTitle}</span>`
                                      + `<ul class="workout-steps" aria-label="Kroki treningu">${stepsHTML}</ul>`;
                        } else {
                            pillInner = day.text;
                        }

                        // ── ARIA: ukryty semantyczny opis dla pigułek quality ─
                        // aria-describedby wskazuje na fizjologiczny cel bodźca.
                        // ID jest unikalne na poziomie tygodnia + dnia, by uniknąć
                        // kolizji przy wielokrotnym wywołaniu renderPlan().
                        const isQuality = day.type === 'quality';
                        const qualDescId = isQuality
                            ? `q-phys-w${week.weekNumber}-d${idx}`
                            : '';
                        const ariaDescAttr = qualDescId
                            ? `aria-describedby="${qualDescId}"`
                            : '';
                        const hiddenPhysDesc = qualDescId
                            ? `<span class="sr-only" id="${qualDescId}">Bodziec fizjologiczny: Podniesienie parametrów beztlenowych i pułapu tlenowego</span>`
                            : '';

                        return `
                            <div class="day-cell">
                                <div class="day-header-row">
                                    <span class="day-name">${DAY_NAMES[idx]}</span>
                                    ${distBadge}
                                </div>
                                <div class="workout-pill type-${day.type}"
                                     aria-label="${TYPE_ARIA[day.type] || day.type}"
                                     ${ariaDescAttr}>
                                    ${hiddenPhysDesc}${pillInner}
                                </div>
                            </div>
                        `;
                    }).join('');

                    const weekEl = document.createElement('article');
                    weekEl.className = `week-container${week.isRecovery ? ' week-recovery' : ''}`;
                    const volLabel = Number(week.targetVol).toFixed(1).replace('.0', '');
                    weekEl.setAttribute('aria-label',
                        `Tydzień ${week.weekNumber}: ${volLabel} km`);
                    weekEl.innerHTML = `
                        <div class="week-header">
                            <div class="week-title">
                                TYDZIEŃ ${week.weekNumber}${recoveryBadge}
                            </div>
                            <div class="week-meta">
                                ${volLabel} km &nbsp;|&nbsp; ${weekStart.toLocaleDateString('pl-PL')}
                            </div>
                        </div>
                        <div class="days-grid" role="list"
                             aria-label="Treningi tygodnia ${week.weekNumber}">${daysHTML}</div>
                    `;
                    phaseEl.appendChild(weekEl);
                });
            });

            // Jednorazowy zapis całej struktury do żywego DOM — jeden reflow.
            container.appendChild(fragment);

            // Płynne przewinięcie do planu (UX: użytkownik od razu widzi efekt)
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // =======================================================
        // GENERATOR INTERWAŁÓW CZASOWYCH — generateAdvancedQualityWorkout()
        // Pure Function: żadnych efektów ubocznych, deterministyczny wynik.
        //
        // Fizjologia VO2max (Maksymalna Moc Tlenowa):
        //   Każde powtórzenie musi trwać 3–4 min — to okno czasowe, w którym
        //   organizm osiąga i utrzymuje szczytowe pochłanianie tlenu (VO2max).
        //   Krótsze odcinki nie aktywują w pełni włókien mięśniowych typu IIa;
        //   dłuższe kumulują zbyt duże stężenie mleczanu bez proporcjonalnego
        //   wzrostu bodźca tlenowego.
        //
        //   Algorytm: na podstawie run_index oblicz prędkość w min/km (run_vo2max),
        //   przelicz na sekundy/km → wyznacz dystans dający dokładnie 3:30 min
        //   → zaokrąglij do 200 m → zweryfikuj zakres (3–4 min).
        // =======================================================

        /**
         * Generuje zaawansowaną jednostkę jakościową opartą na czasie, nie dystansie.
         *
         * @param {'VO2MAX'|'THRESHOLD'|'REPS'} type       Typ bodźca fizjologicznego
         * @param {'I'|'II'|'III'|'IV'}         phaseCode  Kod aktywnego mezocyklu
         * @param {number}                       runIndex   Wskaźnik Wydolności (run_index)
         * @param {Object}                       paces      Wiersz z pacesTable dla danego runIndex
         * @param {string}                       paces.run_easy        Tempo spokojne   (MM:SS /km)
         * @param {string}                       paces.run_threshold   Tempo progowe    (MM:SS /km)
         * @param {string}                       paces.run_vo2max      Tempo interwałów (MM:SS /km)
         * @param {string}                       paces.run_reps        Tempo rytmów     (MM:SS /km)
         * @returns {{ steps: string[], dist: number }}
         *   steps — czytelna lista kroków treningu gotowa do wyświetlenia w UI
         *   dist  — szacunkowy dystans całkowity w km (do sumowania objętości)
         */
        function generateAdvancedQualityWorkout(type, phaseCode, runIndex, paces) {

            // ── Pomocnik: "MM:SS" → sekundy/km ─────────────────────────────
            const paceToSec = (paceStr) => {
                const [mm, ss] = paceStr.split(':').map(Number);
                return mm * 60 + ss;
            };

            // ── Pomocnik: sekundy → "M:SS min" (czytelne dla zawodnika) ────
            const secToMinStr = (totalSec) => {
                const m  = Math.floor(totalSec / 60);
                const s  = Math.round(totalSec % 60);
                return `${m}:${String(s).padStart(2, '0')} min`;
            };

            // ── Wyznaczanie liczby powtórzeń na podstawie fazy ─────────────
            // Fizjologia: Faza II — organizm dopiero adaptuje się do intensywności,
            // 4 powtórzenia są bezpiecznym progiem akumulacji kwasu mlekowego.
            // Faza III — pełna gotowość neuromuskularna pozwala na 5–6 serii.
            const repsMap = { 'I': 3, 'II': 4, 'III': 5, 'IV': 4 };
            const baseReps = repsMap[phaseCode] ?? 4;

            // Faza III co drugi tydzień ← brak dostępu do weekIndex tutaj,
            // dlatego runIndex parzysty/nieparzysty daje naturalną wariację.
            const reps = (phaseCode === 'III' && runIndex % 2 === 0) ? 6 : baseReps;

            if (type === 'VO2MAX') {
                // ── LOGIKA CZASOWA VO2MAX ────────────────────────────────────
                // Cel: jedno powtórzenie trwa dokładnie 3–4 min przy tempie run_vo2max.
                // 1. Przelicz run_vo2max na sec/km
                // 2. Docelowy czas = 210 s (3:30) — środek okna 3–4 min
                // 3. Dystans = targetSec / secPerKm → zaokrąglij do 0.2 km
                // 4. Weryfikacja: czas rzeczywisty ∈ [180, 240] s
                const TARGET_SEC   = 210;  // 3:30 min — środek okna stymulacji VO2max
                const secPerKm     = paceToSec(paces.run_vo2max);
                const rawDistKm    = TARGET_SEC / secPerKm;
                const repDistKm    = Math.round(rawDistKm / 0.2) * 0.2;  // zaokrąglenie co 200 m
                const actualRepSec = repDistKm * secPerKm;

                // Korekcja bezpieczeństwa — jeśli po zaokrągleniu wypadamy poza okno,
                // wróć do surowej wartości zaokrąglonej do 100 m.
                const safeDistKm = (actualRepSec >= 180 && actualRepSec <= 240)
                    ? repDistKm
                    : Math.round(rawDistKm / 0.1) * 0.1;

                const repTimeStr = secToMinStr(safeDistKm * secPerKm);
                const restStr    = '2 min trucht';

                // Dystans całkowity: rozgrzewka + serie + aktywne przerwy (trucht) + schłodzenie
                const restDistKm = (reps - 1) * 0.2;  // 2 min truchtu to ok. 200 m
                const totalDist = parseFloat((3 + reps * safeDistKm + restDistKm + 2).toFixed(1));

                return {
                    steps: [
                        `3 km Rozgrzewka (${paces.run_easy} /km)`,
                        `${reps}× ${repTimeStr} (Tempo: ${paces.run_vo2max} /km) / p. ${restStr}`,
                        `2 km Schłodzenie (${paces.run_easy} /km)`
                    ],
                    dist: totalDist
                };
            }

            if (type === 'THRESHOLD') {
                // ── LOGIKA CZASOWA PROGU MLECZANOWEGO ───────────────────────
                // Fizjologia: ciągły bieg w run_threshold trwający 20–40 min
                // przesuwa próg mleczanowy (MLSS) w górę przez adaptację
                // mitochondrialną i zwiększenie gęstości kapilary.
                const thresholdMinutes = phaseCode === 'III' ? 30 : 20;
                const thresholdDistKm  = parseFloat(
                    ((thresholdMinutes * 60) / paceToSec(paces.run_threshold)).toFixed(1)
                );
                const totalDist = parseFloat((3 + thresholdDistKm + 2).toFixed(1));

                return {
                    steps: [
                        `3 km Rozgrzewka (${paces.run_easy} /km)`,
                        `${thresholdMinutes} min ciągiem (Tempo: ${paces.run_threshold} /km) ≈ ${thresholdDistKm} km`,
                        `2 km Schłodzenie (${paces.run_easy} /km)`
                    ],
                    dist: totalDist
                };
            }

            if (type === 'REPS') {
                // ── LOGIKA CZASOWA RYTMÓW (ekonomia biegu) ──────────────────
                // Fizjologia: krótkie (20–30 s) rytmy w tempie run_reps aktywują
                // szybkie włókna mięśniowe (IIx) i poprawiają ekonomię biegu
                // bez znaczącej akumulacji mleczanu — przerwa > 3× czas trwania.
                const repCount   = reps + 2;  // Rytmy → więcej serii, krótsze odcinki
                const repTimeSec = 20;
                const repDistKm  = parseFloat((repTimeSec / paceToSec(paces.run_reps)).toFixed(2));
                const restDistKm = repCount * 0.1;  // 90 s marszu to ok. 100 m
                const totalDist  = parseFloat((3 + repCount * repDistKm + restDistKm + 3).toFixed(1));

                return {
                    steps: [
                        `3 km Rozgrzewka (${paces.run_easy} /km)`,
                        `${repCount}× 20 sek (Tempo: ${paces.run_reps} /km) / p. 90 sek marsz`,
                        `3 km Schłodzenie (${paces.run_easy} /km)`
                    ],
                    dist: totalDist
                };
            }

            if (type === 'COMPOUND_TR') {
                // ── LOGIKA COMPOUND: PRÓG MLECZANOWY + RYTMY ────────────────
                // Fizjologia: pierwsza część (threshold) stymuluje MLSS i
                // adaptację mitochondrialną przy submaksymalnym wysiłku.
                // Krótka przerwa wypłukuje część mleczanu bez pełnej regeneracji,
                // po czym rytmy w run_reps rekrutują szybkie włókna IIx —
                // efekt "pre-fatigue" pogłębia adaptację nerwowo-mięśniową
                // przy niższym sumarycznym koszcie energetycznym niż dwie osobne sesje.
                const thresholdMin = phaseCode === 'III' ? 20 : 15;
                const thresholdDistKm = parseFloat(
                    ((thresholdMin * 60) / paceToSec(paces.run_threshold)).toFixed(1)
                );

                // Rytmy po zmęczeniu progowym — mniej serii niż w czystym REPS
                const strideCount = phaseCode === 'III' ? 6 : 4;
                const restDistKm = strideCount * 0.1;  // 90 s marszu po każdym rytmie to ok. 100 m
                const totalDist = parseFloat((2 + thresholdDistKm + 0.3 + restDistKm + 2).toFixed(1));

                return {
                    steps: [
                        `2 km Rozgrzewka (${paces.run_easy} /km)`,
                        `${thresholdMin} min ciągiem (Tempo: ${paces.run_threshold} /km) ≈ ${thresholdDistKm} km`,
                        `3 min trucht regeneracyjny`,
                        `${strideCount}× 20 sek (Tempo: ${paces.run_reps} /km) / p. 90 sek marsz`,
                        `2 km Schłodzenie (${paces.run_easy} /km)`
                    ],
                    dist: totalDist
                };
            }

            // Fallback dla nieznanych typów — zwraca prosty bieg spokojny
            return {
                steps: [`Bieg Spokojny (${paces.run_easy} /km)`],
                dist: 8
            };
        }

        // =======================================================
        // FABRYKA MIKROCYKLU — createWeekWorkouts()
        // Czysta funkcja: wejście = parametry tygodnia,
        // wyjście = tablica 7 obiektów dnia (pon–nd).
        //
        // Architektura wewnętrzna:
        //   1. Zbuduj workoutsPool[] (obiekty z tagami: L, Q, Q2, E)
        //   2. Przekaż do mapWorkoutsToDays() — istniejący silnik
        //      rozkładający pulę na konkretne dni kalendarza.
        // =======================================================

        /**
         * Generuje kompletny mikrocykl tygodniowy (7 dni).
         *
         * Fizjologia tygodnia treningowego:
         * - Long Run (tag L): stymulacja mitochondrialna i kapilaryzacja.
         *   Proporcja rośnie przy mniejszej liczbie dni treningowych,
         *   by utrzymać sumaryczny bodziec tlenowy (40% / 30% / 25%).
         * - Akcent główny (tag Q): bodziec specyficzny — próg mleczanowy
         *   lub pułap tlenowy. Rotacja przez pulę ze strategy.
         * - Akcent uzupełniający (tag Q2, 5+ dni): drugi bodziec jakościowy
         *   zwiększa adaptację bez skracania okien regeneracyjnych.
         * - Bieg Spokojny (tag E): aktywna regeneracja i baza tlenowa.
         *
         * @param {'I'|'II'|'III'|'IV'} phaseCode    Kod aktywnego mezocyklu
         * @param {number}              weekIndex     Indeks tygodnia w fazie (0-based)
         * @param {number}              targetVol     Planowana objętość tygodnia (km)
         * @param {Object}              userParams    Parametry użytkownika z Orkiestratora
         * @param {number}              userParams.runIndex        Wskaźnik Wydolności
         * @param {string}              userParams.targetDistance  'k10' | 'hm' | 'mar'
         * @param {number}              userParams.daysPerWeek     Liczba dni treningowych (3–7)
         * @param {boolean}             userParams.isAdvanced      Tryb zaawansowany
         * @param {boolean}             [userParams.isLastWeek]    Ostatni tydzień — dzień startu
         * @returns {Array}  Tablica 7 obiektów dnia z mapWorkoutsToDays()
         */
        function createWeekWorkouts(phaseCode, weekIndex, targetVol, userParams) {

            const { runIndex, targetDistance, daysPerWeek, isAdvanced } = userParams;
            const isLastWeek = userParams.isLastWeek ?? false;

            // ── KROK 1: Pula treningów — zaczynamy od pustej tablicy ─────
            const workoutsPool = [];

            // ── KROK 2: Wstrzyknięcie temp z matrycy run_index ───────────
            // Fallback na '30' chroni przed nieistniejącym kluczem.
            const pVals = pacesTable[runIndex] || pacesTable['30'];

            // Pomocnik: zamienia tokeny placeholder na rzeczywiste wartości temp.
            // Czysta funkcja — nie modyfikuje danych wejściowych.
            const resolvePaces = (desc) =>
                desc
                    .replace('run_threshold', pVals.run_threshold)
                    .replace('run_vo2max',    pVals.run_vo2max)
                    .replace('run_race_pace', pVals.run_race_pace)
                    .replace('run_reps',      pVals.run_reps)
                    .replace('run_easy',      pVals.run_easy);

            // ── KROK 3: Long Run (tag 'L') ───────────────────────────────
            // Fizjologia: proporcja Biegu Długiego rośnie przy mniejszej
            // liczbie dni treningowych, by utrzymać sumaryczny bodziec
            // mitochondrialny i kapilaryzacyjny tygodnia.
            // Zasada: Long Run musi być zawsze najdłuższym treningiem tygodnia —
            // wyższy mnożnik przy 3–4 dniach zapobiega odwróceniu hierarchii,
            // gdzie biegi easy pochłaniałyby większą część objętości niż Long Run.
            let lrMultiplier;
            if      (daysPerWeek === 3) lrMultiplier = 0.45;
            else if (daysPerWeek === 4) lrMultiplier = 0.35;
            else if (daysPerWeek === 5) lrMultiplier = 0.30;
            else                        lrMultiplier = 0.25; // 6 i 7 dni

            let lDist = parseFloat((targetVol * lrMultiplier).toFixed(1));

            let longRunObj = {
                tag:  'L',
                dist: lDist,
                text: `Bieg Długi ${lDist} km (Tempo: ${pVals.run_easy})`
            };

            // Tryb zaawansowany — Faza III: co drugi tydzień Long Run specjalny.
            // Stymulacja specyficzna (run_race_pace lub run_threshold)
            // zamiast tempa spokojnego.
            if (isAdvanced && phaseCode === 'III' && weekIndex % 2 === 0) {
                const hardKey  = weekIndex % 4 === 0 ? 'L_hard_M' : 'L_hard_T';
                const hardData = workoutsDB[hardKey];
                const descAdv  = resolvePaces(hardData.desc);
                longRunObj = {
                    tag:  'L',
                    dist: hardData.km,
                    text: `★ ${hardData.name}: ${descAdv}`
                };
            }

            workoutsPool.push(longRunObj);

            // ── KROK 4: Akcenty — Quality 1 (tag 'Q') ───────────────────
            // Faza I → Rytmy: aktywacja nerwowo-mięśniowa bez progu mleczanowego.
            // Faza IV, ostatni tydzień → START GŁÓWNY.
            // Pozostałe → rotacja przez pulę strategy[targetDistance][phaseCode].
            if (phaseCode === 'I') {

                workoutsPool.push({
                    tag:  'Q',
                    dist: 8,
                    text: `Spokojnie + 6× 20 sek (Rytmy w tempie: ${pVals.run_reps})`
                });

            } else if (phaseCode === 'IV' && isLastWeek) {

                workoutsPool.push({ tag: 'Q', dist: 42.2, text: 'START GŁÓWNY' });

            } else {
                // Bezpieczny fallback: jeśli dystans nie istnieje w strategy, użyj 'mar'
                const distKey = strategy[targetDistance] ? targetDistance : 'mar';
                const pool    = strategy[distKey][phaseCode] || strategy['mar']['II'];
                const wKey    = pool[weekIndex % pool.length];
                const wData   = workoutsDB[wKey];

                if (wData.isDynamic) {
                    // ── ŚCIEŻKA DYNAMICZNA ────────────────────────────────────
                    // Deleguj do generateAdvancedQualityWorkout() — pure function
                    // zwraca { steps, dist } zamiast statycznego pola desc.
                    // Tag 'Q' i name zachowane dla kompatybilności z mapWorkoutsToDays.
                    const dynamic = generateAdvancedQualityWorkout(
                        wData.workoutType,
                        phaseCode,
                        runIndex,
                        pVals
                    );

                    workoutsPool.push({
                        tag:   'Q',
                        dist:  dynamic.dist,
                        steps: dynamic.steps,
                        text:  `${wData.name}: ${dynamic.steps[1]}`  // summary dla fallbacków tekstowych
                    });

                } else {
                    // ── ŚCIEŻKA STATYCZNA (dotychczasowa) ────────────────────
                    const desc = resolvePaces(wData.desc);

                    workoutsPool.push({
                        tag:  'Q',
                        dist: wData.km,
                        text: `${wData.name}: ${desc}`
                    });
                }
            }

            // ── Akcent uzupełniający (tag 'Q2') — tylko 5+ dni, faza II/III ─
            // Fizjologia: drugi bodziec jakościowy zwiększa adaptację
            // bez skracania krytycznego okna regeneracyjnego (Czw → Nd).
            if (daysPerWeek >= 5 && phaseCode !== 'I' && phaseCode !== 'IV') {
                const q2Key  = phaseCode === 'II' ? 'bal_speed_short' : 'bal_tempo_run';
                const q2Data = workoutsDB[q2Key];
                const desc2  = resolvePaces(q2Data.desc);

                workoutsPool.push({
                    tag:  'Q2',
                    dist: q2Data.km,
                    text: `${q2Data.name}: ${desc2}`
                });
            }

            // ── KROK 5: Bieg Spokojny — Easy (tag 'E', wypełniacz objętości) ─
            // Fizjologia: biegi poniżej progu tlenowego budują gęstość
            // sieci kapilarnej i pełnią rolę aktywnej regeneracji.

            // Wyodrębnij składniki puli — referencje do obiektów w workoutsPool,
            // więc mutacje dist/text w Guards propagują się do tablicy automatycznie.
            const longRun      = workoutsPool.find(w => w.tag === 'L');
            const qualityDays  = workoutsPool.filter(w => w.tag === 'Q' || w.tag === 'Q2');
            // -1 za Niedzielę zarezerwowaną dla Long Run
            const easyDaysCount = Math.max(1, daysPerWeek - qualityDays.length - 1);

            // --- STRAŻNICY OBJĘTOŚCI (Volume Guards) ---
            // 1. Zabezpieczenie Długiego Biegu (max 35% objętości tygodniowej)
            const maxLongDist = parseFloat((targetVol * 0.35).toFixed(1));
            if (longRun && longRun.dist > maxLongDist) {
                longRun.dist = maxLongDist;
                longRun.text = `${maxLongDist} km Długi Bieg (${pVals.run_easy})`;
            }

            // 2. Przeliczenie faktycznie zużytych kilometrów po ewentualnym skalowaniu
            let currentQualityDist = qualityDays.reduce((sum, q) => sum + (q.dist || 0), 0);
            let currentLongDist    = longRun ? (longRun.dist || 0) : 0;
            let remainingVol       = targetVol - currentQualityDist - currentLongDist;

            // 3. Obsługa przypadku granicznego (Hard Cap)
            // Jeśli zadeklarowany kilometraż jest za niski dla liczby dni easy (min. 3 km/dzień):
            if (remainingVol < easyDaysCount * 3) {
                const requiredEasyVol = easyDaysCount * 3;
                const deficit         = requiredEasyVol - remainingVol;

                // Obcinamy proporcjonalnie z akcentów i Long Run
                const reductors = qualityDays.length + (longRun ? 1 : 0);
                if (reductors > 0) {
                    const reductionPerItem = deficit / reductors;
                    qualityDays.forEach(q => { q.dist = Math.max(0, q.dist - reductionPerItem); });
                    if (longRun) longRun.dist = Math.max(0, longRun.dist - reductionPerItem);
                }

                remainingVol = requiredEasyVol; // Budżet uratowany
            }

            // 4. Bezpieczny przydział dystansu na biegi spokojne
            let easyDist = parseFloat((remainingVol / easyDaysCount).toFixed(1));

            // Fail-safe: Bieg spokojny nigdy nie może być dłuższy niż Long Run.
            // Jeśli guard jest aktywny, przealokuj pulę: 60% dla Long Run, 40% na easy.
            // Mutacja longRun.dist propaguje się do workoutsPool przez referencję.
            if (longRun && easyDist >= longRun.dist) {
                const totalAvailableForEasyAndLong = (easyDist * easyDaysCount) + longRun.dist;
                longRun.dist = parseFloat((totalAvailableForEasyAndLong * 0.60).toFixed(1));
                easyDist     = parseFloat(((totalAvailableForEasyAndLong - longRun.dist) / easyDaysCount).toFixed(1));
                longRun.text = `${longRun.dist} km Długi Bieg (${pVals.run_easy})`;
            }

            workoutsPool.push({
                tag:  'E',
                dist: easyDist,
                text: `Spokojnie ${easyDist} km (Tempo: ${pVals.run_easy})`
            });

            // ── KROK 6: Mapowanie na dni kalendarza ──────────────────────
            // Delegujemy do mapWorkoutsToDays() — istniejący silnik przypisuje
            // obiekty z workoutsPool do konkretnych 7 dni tygodnia.
            return mapWorkoutsToDays(workoutsPool, daysPerWeek);
        }

        // legacyGenerateSeason — USUNIĘTA. Zastąpiona przez pipeline:
        // generateSeasonController() → calculateTrainingLoad() → renderPlan()
        // Ostatni commit z jej kodem: patrz historia git.
        void 0; // legacyGenerateSeason usunięta — pipeline: generateSeasonController → calculateTrainingLoad → renderPlan

        // WYMUSZENIE PRZELICZENIA NA STARCIE
        document.getElementById('raceTime').dispatchEvent(new Event('change'));

        updateRunIndexDisplay(); // Init


// =======================================================
// NAVIGATION MODULE (Context Boundary Guard)
//
// Integrated into script.js to share the same deferred
// execution context. Nav errors are isolated via try/catch
// so they can NEVER halt the calculator engine.
// =======================================================

/**
 * Pure function — no side effects, deterministic, unit-testable.
 * Inverts a boolean open/closed menu state.
 *
 * @param  {boolean} currentState
 * @returns {boolean} nextState
 */
const toggleMenuState = (currentState) => !currentState;

/**
 * Initialises all navigation interactivity for pages that include
 * both the site-header <nav> and this script:
 *
 *  ① Hamburger ↔ Drawer (mobile)
 *  ② Dropdown trigger ↔ .nav-dropdown panel (desktop :hover / mobile accordion)
 *  ③ "Click outside" closes open panels (desktop UX)
 *  ④ Escape key closes all panels (keyboard / accessibility UX)
 *  ⑤ Context Boundary — nav links to other disciplines trigger hard
 *     URL redirects. This guarantees the JS heap (userRunIndex,
 *     generated plan DOM, pace look-ups) is fully discarded before
 *     a different physiological model loads. Prevents cross-discipline
 *     state contamination (e.g. running run_index leaking into cycling FTP).
 *
 * Wrapped entirely in try/catch: if any nav selector is absent the
 * function returns silently and the calculator remains fully operational.
 */
function initNavigation() {
    try {
        const mobileBtn    = document.getElementById('mobile-menu-btn');
        const menu         = document.getElementById('main-menu');
        const dropTriggers = Array.from(
            document.querySelectorAll('.nav-dropdown-trigger')
        );
        const navLinks = Array.from(
            document.querySelectorAll('.nav-dropdown a[href]')
        );

        // Guard: no navigation markup on this page — exit silently.
        if (!mobileBtn || !menu) return;

        // ── Mutable state scoped to initNavigation ────────────────────────
        let isDrawerOpen = false;
        // One boolean per dropdown trigger; index matches dropTriggers array.
        const isDropdownOpen = dropTriggers.map(() => false);

        // ── ① HAMBURGER — opens / closes the mobile Drawer ───────────────
        mobileBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            isDrawerOpen = toggleMenuState(isDrawerOpen);

            menu.classList.toggle('is-open', isDrawerOpen);
            document.body.classList.toggle('nav-open', isDrawerOpen); // activates CSS scrim
            mobileBtn.setAttribute('aria-expanded', String(isDrawerOpen));
            mobileBtn.querySelector('.material-symbols-outlined').textContent =
                isDrawerOpen ? 'close' : 'menu';
        });

        // ── ② DROPDOWN TRIGGERS — toggle submenu panels ──────────────────
        dropTriggers.forEach(function (trigger, idx) {
            trigger.addEventListener('click', function (e) {
                e.stopPropagation();

                const nextState      = toggleMenuState(isDropdownOpen[idx]);
                isDropdownOpen[idx]  = nextState;

                // Sync aria-expanded on the trigger button
                trigger.setAttribute('aria-expanded', String(nextState));

                // Sync data-open on the parent <li> (drives CSS show/hide)
                const parentItem = trigger.closest('.nav-item--has-dropdown');
                if (parentItem) {
                    if (nextState) {
                        parentItem.setAttribute('data-open', 'true');
                    } else {
                        parentItem.removeAttribute('data-open');
                    }
                }

                // Close every other open dropdown (one panel visible at a time)
                dropTriggers.forEach(function (other, otherIdx) {
                    if (otherIdx !== idx && isDropdownOpen[otherIdx]) {
                        isDropdownOpen[otherIdx] = false;
                        other.setAttribute('aria-expanded', 'false');
                        const otherParent = other.closest('.nav-item--has-dropdown');
                        if (otherParent) otherParent.removeAttribute('data-open');
                    }
                });
            });
        });

        // ── ③ CLICK OUTSIDE — closes drawer + open dropdowns ─────────────
        // CSS scrim (body.nav-open::before) is a pseudo-element; its clicks
        // bubble up to the document, so this handler catches scrim taps too.
        document.addEventListener('click', function (e) {
            if (
                !e.target.closest('#main-menu') &&
                !e.target.closest('#mobile-menu-btn')
            ) {
                closeNavAll();
            }
        });

        // ── ④ ESCAPE KEY — closes everything (keyboard / a11y) ───────────
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeNavAll();
        });

        // ── ⑤ CONTEXT BOUNDARY — enforce hard URL redirect ───────────────
        // Each nav link points to a separate HTML file representing an
        // independent physiological model (running, cycling, diet…).
        // We call window.location.assign() explicitly so that:
        //   a) The browser performs a full page load — JS heap is discarded.
        //   b) In-memory state (userRunIndex, pacesTable, rendered plan DOM)
        //      cannot leak into a different discipline's calculation module.
        //   c) Future SPA refactoring cannot silently swap these links into
        //      DOM-only view changes without this guard making it visible.
        navLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                const href = link.getAttribute('href');

                // Hash-only anchors scroll within the page — no redirect needed.
                if (!href || href.startsWith('#')) return;

                // Prevent any SPA handler higher in the chain from hijacking.
                e.preventDefault();

                // Hard redirect: browser discards all in-memory calculator state.
                window.location.assign(link.href);
            });
        });

        // ── Internal helper ───────────────────────────────────────────────
        function closeNavAll() {
            isDrawerOpen = false;
            menu.classList.remove('is-open');
            document.body.classList.remove('nav-open');
            mobileBtn.setAttribute('aria-expanded', 'false');
            mobileBtn.querySelector('.material-symbols-outlined').textContent = 'menu';

            dropTriggers.forEach(function (trigger, idx) {
                isDropdownOpen[idx] = false;
                trigger.setAttribute('aria-expanded', 'false');
                const parent = trigger.closest('.nav-item--has-dropdown');
                if (parent) parent.removeAttribute('data-open');
            });
        }

    } catch (err) {
        // Navigation setup failed. DO NOT re-throw — the calculator engine
        // must remain fully operational regardless of nav element availability.
        console.warn('[initNavigation] Nav setup skipped:', err.message);
    }
}

// =========================================
// M3 TOP BAR — kolaps przy przewijaniu (znikająca górna belka, zwężona pigułka zakładek)
// =========================================
function initTopBarScroll() {
    const topBar = document.querySelector('.m3-top-bar');
    if (!topBar) return;

    const SCROLL_THRESHOLD_PX = 124;

    function updateScrolledState() {
        const isScrolled = window.scrollY > SCROLL_THRESHOLD_PX;
        topBar.classList.toggle('scrolled', isScrolled);
    }

    let ticking = false;
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(function () {
                updateScrolledState();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScrolledState(); // stan początkowy (np. po odświeżeniu ze scrollem)
}

// =======================================================
// SYSTEM BEZPIECZEŃSTWA: Obsługa Stepperów (+/- 5km)
// =======================================================
function initVolumeSteppers() {
    const stepperBtns = document.querySelectorAll('.stepper-btn');
    
    stepperBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;

            let currentValue = parseInt(input.value, 10) || 0;
            const step = 5;

            if (this.classList.contains('plus')) {
                currentValue += step;
            } else if (this.classList.contains('minus')) {
                currentValue -= step;
                if (currentValue < 0) currentValue = 0;
            }

            input.value = currentValue;
            
            if (typeof updateVolumeColors === 'function') {
                updateVolumeColors();
            }
        });
    });
}

// Uruchomienie stepperów
initVolumeSteppers();

// Bootstrap: script.js is loaded with `defer`, DOM is ready at this point.
initNavigation();
initTopBarScroll();

// =======================================================
// Read-only stepper: pola objętości — tylko +/- (brak edycji z klawiatury).
// =======================================================
function setupVolumeInputGuards() {
    const volumeInputIds = ['startVol', 'targetVol'];

    volumeInputIds.forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;

        // Read-only stepper: brak edycji z klawiatury (wartość tylko +/-).
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') return;
            e.preventDefault();
        });
        input.addEventListener('paste', function(e) {
            e.preventDefault();
        });
    });
}


setupVolumeInputGuards();

// =======================================================
// KOMPONENT: M3 SNACKBAR
// Pure Function — brak efektów ubocznych poza DOM snackbara.
// Zastępuje natywny alert() zachowując tę samą sygnaturę wywołania.
// Guard clause (if !snackbar) chroni przed błędem przy brakującym elemencie.
// =======================================================
function showSnackbar(message) {
    const snackbar = document.getElementById('m3-snackbar');
    if (!snackbar) return;
    snackbar.textContent = message;
    snackbar.classList.add('show');
    setTimeout(() => {
        snackbar.classList.remove('show');
    }, 4000);
}
