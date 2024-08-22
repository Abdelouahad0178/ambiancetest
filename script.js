// Variables globales pour la scène, la caméra et le renderer
let scene, camera, renderer;
let floor, walls = [];

// Définition des textures par défaut pour le sol et les murs
const defaultTextures = {
    floor: 'images/CORE_DECOR_COLD_60X60.jpg',  // Texture par défaut pour le sol
    wall1: 'images/1ANIKSA_PULIDO_120x260.jpg',  // Texture par défaut pour le mur de face (dominant)
    wall2: 'images/DUC_BLANC_BURGUINI_S.T_89.8x269.8.jpg'  // Texture par défaut pour le mur gauche (1/2 largeur)
};

// Chemin vers le dossier contenant les images dynamiques
const dynamicTexturesPath = 'images/';

// Fonction d'initialisation de la scène 3D
function init() {
    // Création de la scène
    scene = new THREE.Scene();
    
    // Configuration de la caméra
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 7);  // Positionnement de la caméra
    camera.lookAt(0, 0, 0);  // Orientation de la caméra vers le centre de la scène

    // Initialisation du renderer avec anti-aliasing pour lisser les bords
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);  // Taille du renderer adaptée à la fenêtre
    renderer.setPixelRatio(window.devicePixelRatio);  // Support de la haute résolution
    document.getElementById('scene-container').appendChild(renderer.domElement);  // Ajout du renderer à la page

    // Ajout d'une lumière ambiante pour un éclairage global uniforme
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);  // Intensité de la lumière réglée à 1 pour plus de clarté
    scene.add(ambientLight);

    // Ajout d'une lumière directionnelle pour simuler une source de lumière naturelle
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);  // Intensité également à 1
    directionalLight.position.set(5, 5, 5);  // Positionnement de la lumière pour éclairer la scène
    scene.add(directionalLight);

    // Charger les textures par défaut pour le sol et les murs
    loadTexture(defaultTextures.floor, createFloor);
    loadTexture(defaultTextures.wall1, createFrontWall);
    loadTexture(defaultTextures.wall2, createLeftWall);

    // Gestion du redimensionnement de la fenêtre pour ajuster la caméra et le renderer
    window.addEventListener('resize', onWindowResize, false);

    // Ajouter les événements de clic sur le sol et les murs pour permettre l'importation d'une nouvelle texture
    document.getElementById('floorTexture1').addEventListener('click', () => {
        importTexture('floor');
    });

    document.getElementById('wallTexture1').addEventListener('click', () => {
        importTexture('wall1');
    });

    document.getElementById('wallTexture2').addEventListener('click', () => {
        importTexture('wall2');
    });
}

// Fonction pour créer un matériau plus lumineux et réfléchissant pour les surfaces
function createMaterial(texture) {
    return new THREE.MeshStandardMaterial({
        map: texture,  // Appliquer la texture
        roughness: 0.4,  // Réduire la rugosité pour un effet plus brillant
        metalness: 0.1,  // Ajouter un peu de métallisation pour refléter plus de lumière
        emissive: new THREE.Color(0x202020),  // Couleur émissive pour ajouter un peu plus de luminosité
        emissiveIntensity: 0.3  // Intensité de la lumière émise pour augmenter la clarté
    });
}

// Fonction pour créer et ajouter le sol à la scène
function createFloor(texture) {
    const floorGeometry = new THREE.PlaneGeometry(5, 5);  // Définition de la géométrie du sol
    const floorMaterial = createMaterial(texture);  // Création du matériau avec la texture spécifiée
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;  // Rotation pour aligner le sol horizontalement
    scene.add(floor);  // Ajout du sol à la scène
    
    renderer.render(scene, camera);  // Rendu de la scène après l'ajout du sol
}

// Fonction pour créer et ajouter le mur de face à la scène
function createFrontWall(texture) {
    const wallGeometry = new THREE.PlaneGeometry(5, 8);  // Définition de la géométrie du mur de face
    const wallMaterial = createMaterial(texture);  // Création du matériau avec la texture spécifiée

    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.y = 1.5;  // Positionnement vertical pour que le mur touche le sol
    wall.position.z = -2.5;  // Positionnement pour que le mur soit en arrière de la scène
    scene.add(wall);  // Ajout du mur de face à la scène

    walls[0] = wall;  // Stockage du mur de face dans le tableau des murs

    renderer.render(scene, camera);  // Rendu de la scène après l'ajout du mur de face
}

// Fonction pour créer et ajouter le mur gauche à la scène
function createLeftWall(texture) {
    const wallGeometry = new THREE.PlaneGeometry(2.5, 5);  // Définition de la géométrie du mur gauche (1/2 largeur)
    const wallMaterial = createMaterial(texture);  // Création du matériau avec la texture spécifiée

    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.y = 2.5;  // Positionnement vertical pour aligner avec le mur de face
    wall.position.x = -2.2;  // Positionnement à gauche du mur de face
    wall.position.z = -0.01;  // Légère avance sur le mur de face pour éviter le chevauchement
    wall.rotation.y = Math.PI / 2.1;  // Rotation pour un angle supérieur à 90 degrés
    scene.add(wall);  // Ajout du mur gauche à la scène

    walls[1] = wall;  // Stockage du mur gauche dans le tableau des murs

    renderer.render(scene, camera);  // Rendu de la scène après l'ajout du mur gauche
}

// Fonction pour charger une texture depuis une URL avec une option de repli en cas d'échec
function loadTexture(url, onLoad) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        url,
        function(texture) {
            texture.encoding = THREE.sRGBEncoding;  // Encodage pour améliorer la qualité des couleurs
            onLoad(texture);  // Exécuter la fonction de création (sol ou mur) après chargement de la texture
        },
        undefined,
        function(error) {
            console.warn(`Erreur lors du chargement de la texture : ${url}, utilisation de la texture par défaut.`);
        }
    );
}

// Fonction pour importer et appliquer une nouvelle texture
function importTexture(target) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const textureURL = e.target.result;  // Charger la texture à partir du fichier sélectionné
                if (target === 'floor') {
                    changeFloorTexture(textureURL);  // Appliquer la texture au sol
                } else if (target === 'wall1') {
                    changeFrontWallTexture(textureURL);  // Appliquer la texture au mur de face
                } else if (target === 'wall2') {
                    changeLeftWallTexture(textureURL);  // Appliquer la texture au mur gauche
                }
            };
            reader.readAsDataURL(file);  // Lire le fichier sélectionné comme URL de données
        }
    });

    input.click();  // Ouvre le sélecteur de fichier
}

// Fonction pour changer la texture d'un ou plusieurs objets
function changeTexture(objects, textureURL) {
    loadTexture(textureURL, (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);  // Répétition de la texture pour un meilleur rendu sur les grandes surfaces
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;

        objects.forEach(object => {
            if (object) {
                object.material.map = texture;  // Appliquer la nouvelle texture
                object.material.needsUpdate = true;  // Marquer le matériau pour mise à jour
            }
        });

        renderer.render(scene, camera);  // Rendu de la scène après changement de texture
    }, textureURL);  // Si erreur, réutiliser la même URL pour retenter le chargement
}

// Fonction pour changer la texture du sol
function changeFloorTexture(textureURL) {
    changeTexture([floor], textureURL);
}

// Fonction pour changer la texture du mur de face
function changeFrontWallTexture(textureURL) {
    changeTexture([walls[0]], textureURL);  // Mur de face est stocké à l'indice 0
}

// Fonction pour changer la texture du mur gauche
function changeLeftWallTexture(textureURL) {
    changeTexture([walls[1]], textureURL);  // Mur gauche est stocké à l'indice 1
}

// Fonction pour gérer le redimensionnement de la fenêtre
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;  // Mettre à jour le ratio d'aspect
    camera.updateProjectionMatrix();  // Mettre à jour la matrice de projection de la caméra
    renderer.setSize(window.innerWidth, window.innerHeight);  // Redimensionner le renderer
}

// Initialisation de la scène et démarrage de l'animation
init();
animate();

// Fonction pour l'animation continue de la scène
function animate() {
    requestAnimationFrame(animate);  // Boucle d'animation
    renderer.render(scene, camera);  // Rendu de la scène à chaque frame
}
