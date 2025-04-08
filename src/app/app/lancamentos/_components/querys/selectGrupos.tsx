
import { SelectGrupos } from "@/app/app/actions/selectActions";
import { useLancamentoContext } from "../contextLancamentoProvider"
import { useGlobalContext } from "@/app/app/contextGlobal";
import { tySelects } from "@/types/types";
import { useQuery} from 'react-query';
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectValue } from "@/components/ui/select";
import { RetOperacao } from "@/app/app/actions/lancamentoActions";
import queryClient from "@/lib/reactQuery";

interface Props {
  pai: string;
}

export default function ComboGrupos ({pai}: Props) { 
  const { setOperacao, fonteId,
          grupoId, setGrupoId, 
          formGrupoId, setFormGrupoId, 
          subGrupoId, setSubGrupoId, 
          setFormSubGrupoId} = useLancamentoContext();
  const {usuarioId, periodoId} = useGlobalContext();

  //Tratamento para o pai do componente
  let valorDefault: string = ""
  if(pai === "Filtros"){
    valorDefault = grupoId.toString();
  }
  if(pai === "Form"){
    valorDefault = formGrupoId.toString();
  }


  //Carrega os Orcamentos
  const { data, isLoading, refetch } = useQuery( ["listaGrupos", usuarioId], async () => {
    const response:tySelects[] = await SelectGrupos(usuarioId);
    return response;
  })

  if(isLoading){
    return(
      <div>
        Carregando...
      </div>
    )
  }

  const SelOperacao = async (grupoID:number) => {
    const oper = await RetOperacao(grupoID);
    setOperacao(oper ?? "");
  }

  const onChange = async (value: string) =>{
    //Tratamento conforme Pai
    if(pai === "Filtros"){
      setGrupoId(Number(value));
      setSubGrupoId(0);
      queryClient.refetchQueries(["lancamentos", periodoId, grupoId, subGrupoId, fonteId]);
    }
    if(pai === "Form"){
      setFormGrupoId(Number(value));
      setFormSubGrupoId(0);
      SelOperacao(Number(value));
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