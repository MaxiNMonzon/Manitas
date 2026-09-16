import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';

describe('UsuarioController', () => {
  let controller: UsuarioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [UsuarioService],
    }).compile(); //beforeEach compila para que el módulo de testing definido
                  //de forma asíncrona mediante una promesa testee los controladores
                  //y servicios para que no tengan errores.

    controller = module.get<UsuarioController>(UsuarioController);
  }); //al no encontrar errores de compilación, la promesa de describe devuelve el controlador de usuario.

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
