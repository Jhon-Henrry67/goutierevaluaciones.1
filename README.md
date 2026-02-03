# Sistema de Evaluación de Residentes
## Hospital Dr. Salvador B. Gautier

Sistema web simple y directo para evaluación de residentes de Emergencología y Cuidado Crítico.

### Características

✅ **Página única**: Todo en un solo archivo HTML, sin complicaciones
✅ **Sin login**: Entra y evalúa directamente
✅ **Datos compartidos**: Todos los profesores ven todas las evaluaciones
✅ **Firmas digitales**: Firma del profesor y residente
✅ **PDF automático**: Se descarga al guardar
✅ **Lista de evaluaciones**: Ver, buscar y filtrar evaluaciones anteriores

### Cómo usar

1. **Abre el archivo**: Simplemente haz doble clic en `index.html`

2. **Completa la evaluación**:
   - Ingresa tu nombre como profesor
   - Datos del residente
   - Califica cada ítem del 1 al 4
   - Agrega observaciones si es necesario
   - Firma en los dos recuadros (tú y el residente)
   - Click en "Guardar Evaluación"

3. **Ver evaluaciones**:
   - Click en la pestaña "Ver Evaluaciones"
   - Busca por nombre o filtra por trimestre
   - Ver detalle, descargar PDF o eliminar

### Nota importante

Los datos se guardan en el navegador de la computadora. Para que varios profesores vean las mismas evaluaciones, deben usar:
- La misma computadora, o
- Una computadora con la misma cuenta de usuario, o
- Exportar/importar los datos

### Archivos

```
├── index.html    # Todo el sistema está aquí
└── README.md     # Esta guía
```

### Desarrollo futuro

Para un sistema más avanzado se recomienda:
- Servidor web con base de datos
- Autenticación de usuarios
- Sincronización en tiempo real

### Hospital Dr. Salvador B. Gautier
Servicio Nacional de Salud