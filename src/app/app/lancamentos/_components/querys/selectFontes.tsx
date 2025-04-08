
import { SelectFontes} from "@/app/app/actions/selectActions";
import { useLancamentoContext } from "../contextLancamentoProvider"
import { useGlobalContext } from "@/app/app/contextGlobal";
import { tySelects } from "@/types/types";
import { useQuery} from 'react-query';
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectValue } from "@/components/ui/select";
import queryClient from "@/lib/reactQuery";


interface Props {
  pai: string;
}

export default function ComboFontes ({pai}: Props) { 
  const { fonteId, setFonteId, 
          formFonteIdO, setFormFonteIdO,
          formFonteIdD, setFormFonteIdD,
        grupoId, subGrupoId} = useLancamentoContext();

  const {usuarioId, periodoId} = useGlobalContext();

  //Tratamento para o pai do componente
  let valorDefault: string = ""
  if(pai === "Filtros"){
    valorDefault = fonteId.toString();
  }
  if(pai === "FormO"){
    valorDefault = formFonteIdO.toString();
  }
  if(pai === "FormD"){
    if(formFonteIdD){
      valorDefault = formFonteIdD.toString();
    }else{
      valorDefault = "0";
    }
  }

  //Carrega os Fontes
  const { data, isLoading, refetch } = useQuery( ["listaFontes", usuarioId], async () => {
    const response:tySelects[] = await SelectFontes(usuarioId);
    return response;
  })

  if(isLoading){
    return(
      <div>
        Carregando...
      </div>
    )
  }

  const onChange = async (value: string) =>{
    //Tratamento conforme Pai
    if(pai === "Filtros"){
      setFonteId(Number(value));
      //Limpar o cache da consulta para atualizar os dados
      queryClient.refetchQueries(["lancamentos", periodoId, grupoId, subGrupoId, fonteId]);  
    }
    if(pai === "FormO"){
      setFormFonteIdO(Number(value));
    }
    if(pai === "FormD"){
      //setFormFonteIdD(Number(value));
      setFormFonteIdD( (value === "0") ? null : Number(value));
    }
    return true
  }

  return(
    <div>
      <Select defaultValue={valorDefault} onValueChange={onChange}>
        <SelectTrigger className="w-full text-sky-800 border-2">
          <SelectValue placeholder="Selecione a conta" />
        </SelectTrigger>
        <SelectContent className="border-2 border-sky-900 p-0 m-0">
          <SelectGroup className="bg-white text-sky-900">
            <SelectItem className="bg-sky-100  text-sky-900"  key={0} value={"0"}>Todos...</SelectItem>
            { data?.map((item, index)=>(
              <SelectItem className="bg-sky-100  text-sky-900"  key={index} value={item.id?.toString()||""}>{item.nome}</SelectItem>
            )

            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )

}