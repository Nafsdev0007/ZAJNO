import * as THREE from "three";
import vertexShader from "../Shaders/vertexShader.glsl";
import fragmentShader from "../Shaders/fragmentShader.glsl";
import gsap from "gsap";
import Swiper from "swiper";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "swiper/css";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);

// Mobile device detection function
function isMobileDevice() {
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i;
  return (
    mobileRegex.test(navigator.userAgent) ||
    window.innerWidth <= 768 ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

function threejs() {
  // Only run Three.js if not a mobile device
  if (isMobileDevice()) return;

  const scene = new THREE.Scene();
  const distance = 10;
  const fov =
    2 * Math.atan(window.innerHeight / 2 / distance) * (180 / Math.PI);
  const camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas"),
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Mobile device detection functionx

  const images = document.querySelectorAll("img");
  const planes = [];

  // Only create Three.js planes if not a mobile device
  images.forEach((image) => {
    const imageBounds = image.getBoundingClientRect();

    const texture = new THREE.TextureLoader().load(image.src);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: texture },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uHover: { value: 0 },
      },
    });
    const geometry = new THREE.PlaneGeometry(
      imageBounds.width,
      imageBounds.height
    );
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      imageBounds.left - window.innerWidth / 2 + imageBounds.width / 2,
      -imageBounds.top + window.innerHeight / 2 - imageBounds.height / 2,
      0
    );
    planes.push(mesh);
    scene.add(mesh);
  });

  function updatePlanesPosition(e) {
    planes.forEach((plane, index) => {
      const image = images[index];
      const imageBounds = image.getBoundingClientRect();
      plane.position.set(
        imageBounds.left - window.innerWidth / 2 + imageBounds.width / 2,
        -imageBounds.top + window.innerHeight / 2 - imageBounds.height / 2,
        0
      );
      // Update texture size
      plane.material.uniforms.uTexture.value.image.width = imageBounds.width;
      plane.material.uniforms.uTexture.value.image.height = imageBounds.height;
      plane.material.uniformsNeedUpdate = true;
    });
  }

  function lenis() {
    // Initialize a new Lenis instance for smooth scrolling
    const lenisInstance = new Lenis();

    // Add scroll event listener
    lenisInstance.on("scroll", (e) => {
      ScrollTrigger.update();
      updatePlanesPosition(e);
    });

    // Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000); // Convert time from seconds to milliseconds
    });

    // Disable lag smoothing in GSAP to prevent any delay in scroll animations
    gsap.ticker.lagSmoothing(0);

    return lenisInstance;
  }

  const lenisScroll = lenis();

  camera.position.z = distance;

  // Modify animate function to check for mobile
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updatePlanesPosition();
  });

  const raycaster = new THREE.Raycaster();

  // Modify mousemove event to check for mobile
  window.addEventListener("mousemove", (event) => {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(planes);

    // Reset hover for all planes first
    planes.forEach((plane) => {
      gsap.to(plane.material.uniforms.uHover, {
        value: 0,
        duration: 0.5,
        onUpdate: () => {
          plane.material.uniformsNeedUpdate = true;
        },
      });
    });

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const plane = intersect.object;

      // Animate mouse position
      gsap.to(plane.material.uniforms.uMouse.value, {
        x: intersect.uv.x,
        y: intersect.uv.y,
        duration: 0.5,
        onUpdate: () => {
          plane.material.uniforms.uMouse.needsUpdate = true;
          plane.material.uniformsNeedUpdate = true;
        },
      });

      // Animate hover effect
      gsap.to(plane.material.uniforms.uHover, {
        value: 1,
        duration: 0.5,
        onUpdate: () => {
          plane.material.uniformsNeedUpdate = true;
        },
      });
    }
  });

  window.addEventListener("mouseout", () => {
    planes.forEach((plane) => {
      plane.material.uniforms.uHover.value = 0;
    });
  });
}

// Only run threejs on desktop
if (!isMobileDevice()) {
  threejs();
}

function gsapAnimations() {
  // Only run GSAP animations if not a mobile device
  if (isMobileDevice()) return;

  const allWorks = document.querySelectorAll(".evry-works");

  // Create a GSAP timeline for more controlled animations
  const workAnimations = {};

  allWorks.forEach((work, index) => {
    // Create a unique timeline for each work item
    workAnimations[index] = gsap.timeline({
      paused: true, // Start paused for more control
      defaults: {
        ease: "power2.out", // Smoother easing
        duration: 0.4,
      },
    });

    // Find all work-anim elements within this specific work item
    const currentWorkAnims = work.querySelectorAll(".work-anim");
    const workNum = work.querySelector(".work-num");
    const workAbtFirstH2 = work.querySelector(".work-abt h2");

    // Prepare the animation
    workAnimations[index]
      .to(currentWorkAnims, {
        y: 0,
        opacity: 1,
        color: "#FF3928",
        stagger: 0.1,
      })
      .to(
        workNum,
        {
          color: "#FF3928",
          duration: 0.4,
        },
        0
      )
      .to(
        workAbtFirstH2,
        {
          color: "#FF3928",
          duration: 0.4,
        },
        0
      );

    // Add hover and out events
    work.addEventListener("mouseenter", () => {
      workAnimations[index].restart();
    });

    work.addEventListener("mouseleave", () => {
      workAnimations[index].reverse();
    });
  });

  // Add ScrollTrigger line animations
  gsap.utils.toArray(".line").forEach((line) => {
    gsap.to(line, {
      height: 224, // Equivalent to h-56 in Tailwind (14rem = 224px)
      width: "1px",
      scrollTrigger: {
        trigger: line,
        start: "top bottom",
        end: "bottom center",
        scrub: 2,
        markers: false, // Set to true for debugging
      },
    });
  });

  gsap.utils.toArray(".line2").forEach((line) => {
    gsap.to(line, {
      height: 127, // Equivalent to h-56 in Tailwind (14rem = 224px)
      width: "1px",
      scrollTrigger: {
        trigger: line,
        start: "top bottom",
        end: "center bottom",
        scrub: 2,
        markers: false, // Set to true for debugging
      },
    });
  });
}

// Only run GSAP animations on desktop
if (!isMobileDevice()) {
  gsapAnimations();
}

function preventInteractions() {
  // Disable right-click context menu
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  // Disable text selection
  document.addEventListener("selectstart", function (e) {
    e.preventDefault();
  });

  // Disable image dragging
  const images = document.querySelectorAll("img");
  images.forEach((img) => {
    img.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });
  });

  // Optional: Add a custom message if someone tries to use dev tools
  document.addEventListener("keydown", function (e) {
    // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J"))
    ) {
      e.preventDefault();
      console.log("Dev tools are disabled.");
    }
  });
}

// Call the function to apply interactions prevention
preventInteractions();

function slider() {
  var swiper = new Swiper(".swiper", {
    slidesPerView: 4, // ডেস্কটপে 4 টা স্লাইড একসাথে
    spaceBetween: 10, // স্লাইডগুলোর মাঝে কিছু গ্যাপ রাখলাম
    width:1350,
    loop: false, // লুপ অফ রাখলাম, চাইলে অন করতে পারো
    scrollbar: {
      el: ".swiper-scrollbar",
      draggable: true,
    },
    breakpoints: {
      768: {
        slidesPerView: 4,
      },
    },
    mousewheel: true, // মাউস স্ক্রল দিয়ে পরিবর্তনের জন্য
    direction: "horizontal", // ডিরেকশন ফিক্স করে দিলাম
  });
}

slider();


