import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/controls/OrbitControls.js';

// Variables globales pour la scène, la caméra et le renderer
let scene, camera, renderer;
let floor, walls = [];
let controls; // Déclaration de la variable pour OrbitControls
let isDragging = false; // Déclaration pour les mouvements
let previousMousePosition = { x: 0, y: 0 }; // Position précédente de la souris/tactile
let touchStartPosition = { x: 0, y: 0 }; // Position de départ du toucher

// Définition des textures par défaut pour le sol et les murs
const defaultTextures = {
    floor: 'images/CORE_DECOR_COLD_60X60.jpg',  // Texture par défaut pour le sol
    wall1: 'images/1ANIKSA_PULIDO_120x260.jpg',  // Texture par défaut pour le mur de face (dominant)
    wall2: 'images/DUC_BLANC_BURGUINI_S.T_89.8x269.8.jpg'  // Texture par défaut pour le mur gauche (1/2 largeur)
};

// Fonction d'initialisation de la scène 3D
function init() {
    // Création de la scène
    scene = new THREE.Scene();
    
    // Configuration de la caméra
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 7);  // Positionnement de la caméra
    camera.lookAt(0, 0, 0);  // Orientation de la caméra vers le centre de la scène

    // Initialisation du renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);  // Taille du renderer
    renderer.setPixelRatio(window.devicePixelRatio);  // Support de la haute résolution
    document.getElementById('scene-container').appendChild(renderer.domElement);  // Ajout du renderer à la page

    // Initialisation d'OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Activation de l’amortissement (inertie)
    controls.dampingFactor = 0.25; // Facteur d’amortissement
    controls.screenSpacePanning = false; // Ne pas autoriser le déplacement sur l’écran
    controls.maxPolarAngle = Math.PI / 2; // Limiter l’angle d’élévation de la caméra à 90 degrés

    // Ajout de lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Chargement des textures
    loadTexture(defaultTextures.floor, createFloor);
    loadTexture(defaultTextures.wall1, createFrontWall);
    loadTexture(defaultTextures.wall2, createLeftWall);

    // Gestion du redimensionnement de la fenêtre
    window.addEventListener('resize', onWindowResize, false);

    // Événements pour changer les textures
    document.getElementById('floorTexture1').addEventListener('click', () => {
        importTexture('floor');
    });

    document.getElementById('wallTexture1').addEventListener('click', () => {
        importTexture('wall1');
    });

    document.getElementById('wallTexture2').addEventListener('click', () => {
        importTexture('wall2');
    });

    // Gestion des événements de la souris et tactiles
    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('mouseup', onMouseUp, false);

    document.addEventListener('touchstart', onTouchStart, false);
    document.addEventListener('touchmove', onTouchMove, false);
    document.addEventListener('touchend', onTouchEnd, false);
}

// Fonction pour gérer les mouvements de la souris
function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseMove(event) {
    if (isDragging) {
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        const deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
                deltaMove.y * 0.01,
                deltaMove.x * 0.01,
                0,
                'XYZ'
            ));

        camera.quaternion.multiplyQuaternions(deltaRotationQuaternion, camera.quaternion);

        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
}

function onMouseUp() {
    isDragging = false;
}

// Fonction pour gérer les mouvements tactiles
function onTouchStart(event) {
    if (event.touches.length === 1) {
        touchStartPosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
        isDragging = true;
    }
}

function onTouchMove(event) {
    if (isDragging && event.touches.length === 1) {
        const touchCurrentPosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };

        const deltaMove = {
            x: touchCurrentPosition.x - touchStartPosition.x,
            y: touchCurrentPosition.y - touchStartPosition.y
        };

        const deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
                deltaMove.y * 0.01,
                deltaMove.x * 0.01,
                0,
                'XYZ'
            ));

        camera.quaternion.multiplyQuaternions(deltaRotationQuaternion, camera.quaternion);

        touchStartPosition = touchCurrentPosition;
    }
}

function onTouchEnd() {
    isDragging = false;
}

// Fonction d'animation continue
function animate() {
    requestAnimationFrame(animate);
    controls.update();  // Mise à jour des contrôles
    renderer.render(scene, camera);
}

// Initialisation et démarrage
init();
animate();
