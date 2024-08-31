import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, Event, ActivatedRoute } from '@angular/router';
import { IFactura } from 'src/app/Interfaces/factura';
import { ICliente } from 'src/app/Interfaces/icliente';
import { ClientesService } from 'src/app/Services/clientes.service';
import { FacturaService } from 'src/app/Services/factura.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-nuevafactura',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './nuevafactura.component.html',
  styleUrl: './nuevafactura.component.scss'
})
export class NuevafacturaComponent implements OnInit {
  //variables o constantes
  titulo = 'Nueva Factura';
  listaClientes: ICliente[] = [];
  listaClientesFiltrada: ICliente[] = [];
  totalapagar: number = 0;
  idFactura: number = 0;
  //formgroup
  frm_factura: FormGroup;

  ///////
  constructor(
    private clietesServicios: ClientesService,
    private facturaService: FacturaService,
    private navegacion: Router,

    private ruta: ActivatedRoute,

  ) {}

  ngOnInit(): void {
    this.llenar();
    const idFacturaParam = this.ruta.snapshot.paramMap.get('id');
    this.idFactura = idFacturaParam ? parseInt(idFacturaParam) : 0;
    
    if (this.idFactura > 0) {
      this.uno(this.idFactura);
    }
  }
  

  llenar(){
    this.frm_factura = new FormGroup({
      Fecha: new FormControl('', Validators.required),
      Sub_total: new FormControl('', Validators.required),
      Sub_total_iva: new FormControl('', Validators.required),
      Valor_IVA: new FormControl('0.15', Validators.required),
      Clientes_idClientes: new FormControl('', Validators.required)
    });

    this.clietesServicios.todos().subscribe({
      next: (data) => {
        this.listaClientes = data;
        this.listaClientesFiltrada = data;
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  uno(idFactura: number) {
    this.facturaService.uno(idFactura).subscribe((respuesta) => {
      console.log(respuesta);
      this.idFactura = idFactura;
      // this.frm_factura.patchValue(respuesta);
      this.frm_factura.get('Fecha')?.setValue(respuesta.Fecha.split(' ')[0]);
      this.frm_factura.get('Sub_total')?.setValue(respuesta.Sub_total);
      this.frm_factura.get('Sub_total_iva')?.setValue(respuesta.Sub_total_iva);
      this.frm_factura.get('Valor_IVA')?.setValue(respuesta.Valor_IVA);
      this.frm_factura.get('Clientes_idClientes')?.setValue(respuesta.Clientes_idClientes);
      // this.totalapagar = parseInt(respuesta.Sub_total) + parseInt(respuesta.Sub_total_iva);
    });
  }

  

  grabar() {
    
    let factura: IFactura = {
      Fecha: this.frm_factura.get('Fecha')?.value,
      Sub_total: this.frm_factura.get('Sub_total')?.value,
      Sub_total_iva: this.frm_factura.get('Sub_total_iva')?.value,
      Valor_IVA: this.frm_factura.get('Valor_IVA')?.value,
      Clientes_idClientes: this.frm_factura.get('Clientes_idClientes')?.value
    };
    console.log(factura);

    if(this.idFactura > 0){
      factura.idFactura = this.idFactura;
      this.facturaService.actualizar(factura).subscribe((respuesta) => {
        if (parseInt(respuesta) > 0) {
          // alert('Factura grabada');
          Swal.fire({
            title: 'Actualizado',
            text: 'Factura actualizada Correctamentee',
            icon: 'success',
            showCancelButton: false,
            showConfirmButton: false,
          })
          this.navegacion.navigate(['/facturas']);
        }
      });
    }else{

      this.facturaService.insertar(factura).subscribe((respuesta) => {
        if (parseInt(respuesta) > 0) {
          Swal.fire({
            title: 'Guardado',
            text: 'Factura guardada Correctamentee',
            icon: 'success',
            showCancelButton: false,
            showConfirmButton: false,
          })
          this.navegacion.navigate(['/facturas']);
        }
      });
    }

  }
  calculos() {
    let sub_total = this.frm_factura.get('Sub_total')?.value;
    let iva = this.frm_factura.get('Valor_IVA')?.value;
    let sub_total_iva = sub_total * iva;
    this.frm_factura.get('Sub_total_iva')?.setValue(sub_total_iva);
    this.totalapagar = parseInt(sub_total) + sub_total_iva;
  }

  cambio(objetoSleect: any) {
    let idCliente = objetoSleect.target.value;
    this.frm_factura.get('Clientes_idClientes')?.setValue(idCliente);
  }
}
