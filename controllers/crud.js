//Invocamos a la conexion de la DB
const conexion = require('../database/db');
const { uploadFile, AWS_BUCKET_NAME, client } = require('../s3');
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");


//GUARDAR un REGISTRO
exports.save = async (req, res) => {
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const edad = req.body.edad;
    const correo = req.body.correo;
    const imagen = req.file.filename;

    const prod = {
        nombre: nombre,
        apellido: apellido,
        edad: edad,
        correo: correo,
        imagen: imagen
    };

    await uploadFile(req.file, prod);
    conexion.query('INSERT INTO estudiantes SET ?',{nombre:nombre, apellido:apellido, edad:edad, correo:correo, imagen:imagen}, (error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.redirect('/');         
        }
    });
};

//ACTUALIZAR un REGISTRO
exports.update = async (req, res) => {
    const id = req.body.id;
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const edad = req.body.edad;
    const correo = req.body.correo;
    let nuevaImagen = req.file ? req.file.filename : null;
  
    try {
      // Obtener el nombre de la imagen anterior desde la base de datos
      const nombreImagenAnterior = await obtenerNombreImagenAnteriorDesdeBD(id);
      const prod = {
        nombre: nombre,
        apellido: apellido,
        edad: edad,
        correo: correo,
        imagen: nuevaImagen
      };
  
      if (nuevaImagen) {
        // Eliminar la imagen anterior del bucket
        await eliminarImagenDelBucket(nombreImagenAnterior);
  
        // Cargar la nueva imagen en el bucket
        await uploadFile(req.file, prod);
      }else {
        // No se proporcionó una nueva imagen, mantener la imagen anterior en la base de datos
        nuevaImagen = nombreImagenAnterior;
      }
  
      // Actualizar la información del producto en la base de datos
      const query = 'UPDATE estudiantes SET ? WHERE id = ?';
      const values = {
        nombre: nombre,
        apellido: apellido,
        edad: edad,
        correo: correo,
        imagen: nuevaImagen,
      };
  
      conexion.query(query, [values, id], (error, results) => {
        if (error) {
          console.log(error);
        } else {
          res.redirect('/');
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).send('Error en el servidor');
    }
  };
  
  async function obtenerNombreImagenAnteriorDesdeBD(id) {
    return new Promise((resolve, reject) => {
      conexion.query(
        'SELECT imagen FROM estudiantes WHERE id = ?',
        [id],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            if (results.length > 0) {
              resolve(results[0].imagen);
            } else {
              reject('No se encontró el producto');
            }
          }
        }
      );
    });
  }
  
  async function eliminarImagenDelBucket(nombreImagen) {
    const deleteParams = {
      Bucket: AWS_BUCKET_NAME,
      Key: nombreImagen,
    };
  
    await client.send(new DeleteObjectCommand(deleteParams));
  }
  
  