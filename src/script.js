import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import init from './init';

import './style.css';

const { sizes, camera, scene, canvas, controls, renderer } = init();

// Устанавливаем позицию камеры
camera.position.set(0, 2, 5);

// Создаем плоскость (пол)
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5,
    })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI / 2; // Разворачиваем плоскость, чтобы она была горизонтальной
scene.add(floor);

// Добавляем освещение
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
scene.add(dirLight);

// Переменные для управления аватаром
let avatar = null;
const moveSpeed = 0.1; // Скорость движения
const rotationSpeed = 0.1; // Скорость поворота
const keysPressed = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
};

// Загружаем аватар
const loader = new GLTFLoader();
loader.load('/models/avatar.glb', (gltf) => {
    console.log('Модель успешно загружена');
    console.log(gltf);

    avatar = gltf.scene.children[0];
    avatar.scale.set(1, 1, 1);

    // Рассчитываем размер модели, чтобы правильно установить её позицию
    const boundingBox = new THREE.Box3().setFromObject(avatar);
    const avatarHeight = boundingBox.max.y - boundingBox.min.y;
    avatar.position.set(0, avatarHeight / 2, 0); // Устанавливаем аватар над плоскостью

    // Поворачиваем модель, чтобы её "лицо" смотрело вдоль оси Z
    avatar.rotation.y = Math.PI; // Разворачиваем её на 180 градусов

    scene.add(avatar);
});

// Функция для обновления позиции и поворота аватара
const updateAvatarPosition = () => {
    if (!avatar) return;

    const moveDirection = new THREE.Vector3(0, 0, 0); // Вектор движения
    let rotationAngle = null; // Угол поворота (если требуется)

    if (keysPressed.ArrowUp) {
        moveDirection.z -= moveSpeed; // Вперед
        rotationAngle = Math.PI; // Поворот "лицом вперед"
    }
    if (keysPressed.ArrowDown) {
        moveDirection.z += moveSpeed; // Назад
        rotationAngle = 0; // Поворот "лицом назад"
    }
    if (keysPressed.ArrowLeft) {
        moveDirection.x -= moveSpeed; // Влево
        rotationAngle = -Math.PI / 2; // Поворот "лицом влево"
    }
    if (keysPressed.ArrowRight) {
        moveDirection.x += moveSpeed; // Вправо
        rotationAngle = Math.PI / 2; // Поворот "лицом вправо"
    }

    // Обновляем позицию
    avatar.position.add(moveDirection);

    // Обновляем поворот, если есть активная клавиша
    if (rotationAngle !== null) {
        avatar.rotation.y = THREE.MathUtils.lerp(avatar.rotation.y, rotationAngle, rotationSpeed);
    }
};

// Обработчики событий нажатия и отпускания клавиш
window.addEventListener('keydown', (event) => {
    if (keysPressed.hasOwnProperty(event.key)) {
        keysPressed[event.key] = true;
    }
});

window.addEventListener('keyup', (event) => {
    if (keysPressed.hasOwnProperty(event.key)) {
        keysPressed[event.key] = false;
    }
});

// Функция обновления сцены
const tick = () => {
    updateAvatarPosition(); // Обновляем позицию и поворот аватара
    controls.update(); // Обновляем контроллеры
    renderer.render(scene, camera); // Рендерим сцену
    window.requestAnimationFrame(tick);
};
tick();

// Обработчики событий для поддержки ресайза
window.addEventListener('resize', () => {
    // Обновляем размеры
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Обновляем соотношение сторон камеры
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Обновляем renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.render(scene, camera);
});

// Обработчик двойного клика для полноэкранного режима
window.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
        canvas.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});
