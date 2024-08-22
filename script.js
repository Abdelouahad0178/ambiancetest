let scene, camera, renderer;
let floor, walls = [];

// Images par défaut pour le sol et les murs
const defaultTextures = {
    floor: 'images/CORE_DECOR_COLD_60X60.jpg',
    wall1: 'images/1ANIKSA_PULIDO_120x260.jpg',  // Image de face (dominante)
    wall2: 'images/DUC_BLANC_BURGUINI_S.T_89.8x269.8.jpg'  // Image de gauche (1/2 largeur)
};

// Chemin vers le dossier contenant les images dynamiques
const dynamicTexturesPath = 'images/';

let selectedTextureTarget = null;  // Variable pour stocker la sélection (sol, mur1, mur2)

function init() {
    // Initialisation de la scène 3D
    scene = new THREE.Scene();
    
    // Configuration de la caméra
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 7);
    camera.lookAt(0, 0, 0);

    // Initialisation du renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    // Augmenter l'intensité des lumières de la scène
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);  // Intensité augmentée à 1
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);  // Intensité augmentée à 1
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Désactivation initiale des boutons pour éviter les erreurs avant le chargement des textures
    disableButtons(true);

    // Charger les textures depuis le dossier dynamique ou utiliser les valeurs par défaut
    loadTexture(`${dynamicTexturesPath}CORE_DECOR_COLD_60X60.jpg`, createFloor, defaultTextures.floor);
    loadTexture(`${dynamicTexturesPath}1ANIKSA_PULIDO_120x260.jpg`, createFrontWall, defaultTextures.wall1);
    loadTexture(`${dynamicTexturesPath}DUC_BLANC_BURGUINI_S.T_89.8x269.8.jpg`, createLeftWall, defaultTextures.wall2);

    // Gérer le redimensionnement de la fenêtre
    window.addEventListener('resize', onWindowResize, false);
}

function disableButtons(disabled) {
    // Fonction pour désactiver/activer les boutons
    const buttons = ['floorTexture1', 'floorTexture2', 'wallTexture1', 'wallTexture2'];
    buttons.forEach(id => document.getElementById(id).disabled = disabled);
}

function createMaterial(texture) {
    // Créer un matériau plus lumineux pour les surfaces
    return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.4,  // Réduire la rugosité pour un effet plus brillant
        metalness: 0.1,  // Ajouter un peu de métallisation pour refléter plus de lumière
        emissive: new THREE.Color(0x202020),  // Couleur émissive pour ajouter un peu plus de luminosité
        emissiveIntensity: 0.3  // Intensité de la lumière émise
    });
}

function createFloor(texture) {
    // Créer le sol avec le matériau ajusté
    const floorGeometry = new THREE.PlaneGeometry(5, 5);
    const floorMaterial = createMaterial(texture);
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    
    // Activer les boutons une fois que la texture est appliquée
    disableButtons(false);
    renderer.render(scene, camera);
}

function createFrontWall(texture) {
    // Créer le mur de face avec le matériau ajusté
    const wallGeometry = new THREE.PlaneGeometry(5, 5);
    const wallMaterial = createMaterial(texture);

    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.y = 2.5;
    wall.position.z = -2.5;
    scene.add(wall);

    walls[0] = wall;

    renderer.render(scene, camera);
}

function createLeftWall(texture) {
    // Créer le mur gauche avec le matériau ajusté
    const wallGeometry = new THREE.PlaneGeometry(2.5, 5);
    const wallMaterial = createMaterial(texture);

    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.y = 2.5;
    wall.position.x = -2.5;
    wall.position.z = -0.01;
    wall.rotation.y = Math.PI / 2.5;
    scene.add(wall);

    walls[1] = wall;

    renderer.render(scene, camera);
}

function loadTexture(url, onLoad, fallbackUrl) {
    // Fonction pour charger une texture depuis une URL avec une option de repli
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        url,
        function(texture) {
            console.log(`Texture chargée : ${url}`);
            texture.encoding = THREE.sRGBEncoding;
            onLoad(texture);
        },
        undefined,
        function(error) {
            console.warn(`Erreur lors du chargement de la texture : ${url}, utilisation de la texture par défaut.`);
            // Si le chargement échoue, charger la texture par défaut
            textureLoader.load(fallbackUrl, function(texture) {
                texture.encoding = THREE.sRGBEncoding;
                onLoad(texture);
            });
        }
    );
}

function changeTexture(objects, textureURL) {
    // Fonction pour changer la texture d'un ou plusieurs objets
    loadTexture(textureURL, (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;

        objects.forEach(object => {
            if (object) {
                object.material.map = texture;
                object.material.needsUpdate = true;
            }
        });

        renderer.render(scene, camera);
    }, textureURL); // En cas d'erreur, réutiliser la même URL pour tenter de recharger
}

function changeFloorTexture(textureURL) {
    // Changer la texture du sol
    changeTexture([floor], textureURL);
}

function changeFrontWallTexture(textureURL) {
    // Changer la texture du mur de face
    changeTexture([walls[0]], textureURL); // Mur de face est à l'indice 0
}

function changeLeftWallTexture(textureURL) {
    // Changer la texture du mur à gauche
    changeTexture([walls[1]], textureURL); // Mur gauche est à l'indice 1
}

function onWindowResize() {
    // Fonction pour ajuster la caméra et le renderer lors du redimensionnement de la fenêtre
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Fonction pour gérer la sélection du type de texture (sol ou mur)
function handleTextureSelection() {
    const textureType = prompt("Choisissez la texture à modifier : 1 pour le Sol, 2 pour les Murs");
    
    if (textureType === "1") {
        selectedTextureTarget = "floor";
        document.getElementById('fileInput').click();  // Déclenche l'ouverture du sélecteur de fichier
    } else if (textureType === "2") {
        const wallChoice = prompt("Choisissez le mur : 1 pour le mur de face, 2 pour le mur gauche");
        if (wallChoice === "1") {
            selectedTextureTarget = "wall1";
        } else if (wallChoice === "2") {
            selectedTextureTarget = "wall2";
        }
        document.getElementById('fileInput').click();  // Déclenche l'ouverture du sélecteur de fichier
    } else {
        alert("Choix invalide. Veuillez sélectionner 1 pour le sol ou 2 pour les murs.");
    }
}

// Gestionnaire d'événements pour le changement de texture via un fichier uploadé par l'utilisateur
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && selectedTextureTarget) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const textureURL = e.target.result;
            if (selectedTextureTarget === "floor") {
                changeFloorTexture(textureURL);
            } else if (selectedTextureTarget === "wall1") {
                changeFrontWallTexture(textureURL);
            } else if (selectedTextureTarget === "wall2") {
                changeLeftWallTexture(textureURL);
            }
            selectedTextureTarget = null;  // Réinitialiser après utilisation
        };
        reader.readAsDataURL(file);
    } else {
        console.error('Aucun fichier sélectionné ou aucune sélection de texture valide.');
    }
});

// Ajout de l'événement de sélection de texture
document.getElementById('fileInputTrigger').addEventListener('click', handleTextureSelection);

// Gestionnaires d'événements pour les boutons de changement de texture
document.getElementById('floorTexture1').addEventListener('click', () => {
    changeFloorTexture(`${dynamicTexturesPath}CORE_DECOR_COLD_60X60.jpg`);
});

document.getElementById('floorTexture2').addEventListener('click', () => {
    changeFloorTexture(`${dynamicTexturesPath}1VESTIGE260X120_VESTIGE_PULIDO.jpg`);
});

document.getElementById('wallTexture1').addEventListener('click', () => {
    changeFrontWallTexture(`${dynamicTexturesPath}1ANIKSA_PULIDO_120x260.jpg`);
});

document.getElementById('wallTexture2').addEventListener('click', () => {
    changeLeftWallTexture(`${dynamicTexturesPath}DUC_BLANC_BURGUINI_S.T_89.8x269.8.jpg`);
});

// Initialisation de la scène et démarrage de l'animation
init();
animate();

function animate() {
    // Fonction pour l'animation continue de la scène
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
