/*
 * Validación accesible del formulario.
 * - Cada error se explica con texto junto al campo, no solo con color (WCAG 1.4.1 y 3.3.1).
 * - El campo con error recibe aria-invalid="true" y se enlaza al mensaje con aria-describedby.
 * - Arriba aparece un resumen con enlaces a cada campo con error y recibe el foco.
 * - Si JavaScript falla, el navegador sigue validando con los atributos required y type (mejora progresiva).
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var formulario = document.getElementById('formulario-datos');
        if (!formulario) {
            return;
        }

        var resumen = document.getElementById('resumen-errores');
        var exito = document.getElementById('mensaje-exito');

        // Con JavaScript activo se usan los mensajes propios en español.
        formulario.setAttribute('novalidate', '');

        var reglas = [
            {
                id: 'nombre',
                validar: function (campo) {
                    return campo.value.trim() === '' ? 'Escriba su nombre.' : '';
                }
            },
            {
                id: 'apellido',
                validar: function (campo) {
                    return campo.value.trim() === '' ? 'Escriba su apellido.' : '';
                }
            },
            {
                id: 'correo',
                validar: function (campo) {
                    if (campo.value.trim() === '') {
                        return 'Escriba su correo electrónico.';
                    }
                    if (campo.validity.typeMismatch) {
                        return 'El correo no tiene un formato válido. Ejemplo: nombre@utm.edu.ec';
                    }
                    return '';
                }
            },
            {
                id: 'edad',
                validar: function (campo) {
                    if (campo.value === '') {
                        return '';
                    }
                    if (campo.validity.badInput || campo.validity.rangeUnderflow ||
                            campo.validity.rangeOverflow || campo.validity.stepMismatch) {
                        return 'La edad debe ser un número entero entre 15 y 99.';
                    }
                    return '';
                }
            },
            {
                id: 'sitio-web',
                validar: function (campo) {
                    if (campo.value !== '' && campo.validity.typeMismatch) {
                        return 'La dirección debe empezar con https:// o http://';
                    }
                    return '';
                }
            }
        ];

        function mostrarError(campo, mensaje) {
            var error = document.getElementById('error-' + campo.id);
            if (mensaje) {
                campo.setAttribute('aria-invalid', 'true');
                error.textContent = 'Error: ' + mensaje;
            } else {
                campo.removeAttribute('aria-invalid');
                error.textContent = '';
            }
        }

        function validarCampo(regla) {
            var campo = document.getElementById(regla.id);
            var mensaje = regla.validar(campo);
            mostrarError(campo, mensaje);
            return mensaje ? { campo: campo, mensaje: mensaje } : null;
        }

        // Al salir de un campo que ya tenía error, se vuelve a revisar para quitar el aviso.
        reglas.forEach(function (regla) {
            var campo = document.getElementById(regla.id);
            campo.addEventListener('blur', function () {
                if (campo.getAttribute('aria-invalid') === 'true') {
                    validarCampo(regla);
                }
            });
        });

        formulario.addEventListener('submit', function (evento) {
            evento.preventDefault();
            exito.textContent = '';
            resumen.textContent = '';

            var errores = reglas.map(validarCampo).filter(Boolean);

            if (errores.length > 0) {
                var titulo = document.createElement('h2');
                titulo.textContent = 'El formulario tiene ' + errores.length +
                    (errores.length === 1 ? ' error' : ' errores') + ':';
                var lista = document.createElement('ul');
                errores.forEach(function (error) {
                    var item = document.createElement('li');
                    var enlace = document.createElement('a');
                    enlace.href = '#' + error.campo.id;
                    enlace.textContent = error.mensaje;
                    item.appendChild(enlace);
                    lista.appendChild(item);
                });
                resumen.appendChild(titulo);
                resumen.appendChild(lista);
                resumen.focus();
                return;
            }

            var nombre = document.getElementById('nombre').value.trim();
            exito.textContent = 'Gracias, ' + nombre + '. Sus datos se revisaron correctamente. ' +
                '(Este sitio es de práctica: la información no se envía a ningún servidor).';
            formulario.reset();
        });

        formulario.addEventListener('reset', function () {
            reglas.forEach(function (regla) {
                mostrarError(document.getElementById(regla.id), '');
            });
            resumen.textContent = '';
        });
    });
}());
