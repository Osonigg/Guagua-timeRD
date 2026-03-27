const DATA_PATH = "/Backend/data";

export async function cargarJSON(archivo) {
    try {
        const respuesta = await fetch(`${DATA_PATH}${archivo}`);
        if (!respuesta.ok) throw new Error(`Error al cargar: ${archivo}`);
        return await respuesta.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}
